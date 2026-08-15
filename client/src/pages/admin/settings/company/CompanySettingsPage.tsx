import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { toast } from "react-toastify";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import { useSiteConfig } from "../../../../contexts/SiteConfigContext";
import {
  ApiError,
  fetchCompanyProfile,
  fetchCountryDialCodes,
  fetchTenantBrandingOverrides,
  updateCompanyProfile,
  updateTenantBranding,
} from "../../../../lib/api";
import type {
  CompanyProfile,
  PatchCompanyProfileInput,
  PatchTenantBrandingInput,
} from "../../../../types";
import { hasFormChanges, pickChangedFields } from "../../../../utils/form";
import { getUniqueDialCodes } from "../../../../utils/phone";
import { isAnyQueryInitialLoad } from "../../../../utils/query";
import { CompanySettingsTabs } from "./components/CompanySettingsTabs";
import type { CompanyProfileFormValues } from "./components/CompanyProfileForm";
import type { TenantBrandingFormValues } from "./components/TenantBrandingForm";
import type { CompanySettingsTab } from "./utils";

const profileFormKeys = [
  "name",
  "address",
  "logoUrl",
  "defaultPhoneDialCode",
] as const;
const brandingFormKeys = ["logoUrl"] as const;

const toProfileFormValues = (
  profile: CompanyProfile,
): CompanyProfileFormValues => ({
  name: profile.name,
  address: profile.address ?? "",
  logoUrl: profile.logoUrl ?? "",
  defaultPhoneDialCode: profile.defaultPhoneDialCode,
});

const toBrandingFormValues = (overrides: {
  logoUrl: string | null;
}): TenantBrandingFormValues => ({
  logoUrl: overrides.logoUrl ?? "",
});

const toProfilePatchInput = (
  values: CompanyProfileFormValues,
  original: CompanyProfileFormValues,
): PatchCompanyProfileInput => {
  const changed = pickChangedFields(
    values as unknown as Record<string, unknown>,
    original as unknown as Record<string, unknown>,
    [...profileFormKeys],
  );
  const input: PatchCompanyProfileInput = {};

  if (changed.name !== undefined) {
    input.name = String(changed.name);
  }
  if (changed.address !== undefined) {
    input.address = String(changed.address);
  }
  if (changed.logoUrl !== undefined) {
    input.logoUrl = String(changed.logoUrl) || null;
  }
  if (changed.defaultPhoneDialCode !== undefined) {
    input.defaultPhoneDialCode = String(changed.defaultPhoneDialCode);
  }

  return input;
};

const toBrandingPatchInput = (
  values: TenantBrandingFormValues,
  original: TenantBrandingFormValues,
): PatchTenantBrandingInput => {
  const changed = pickChangedFields(values, original, [...brandingFormKeys]);
  const input: PatchTenantBrandingInput = {};

  if (changed.logoUrl !== undefined) {
    input.logoUrl = String(changed.logoUrl) || null;
  }

  return input;
};

export const CompanySettingsPage = () => {
  const { user } = useAuth();
  const { displayName, refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [profileValues, setProfileValues] =
    useState<CompanyProfileFormValues | null>(null);
  const [profileOriginal, setProfileOriginal] =
    useState<CompanyProfileFormValues | null>(null);
  const [brandingValues, setBrandingValues] =
    useState<TenantBrandingFormValues | null>(null);
  const [brandingOriginal, setBrandingOriginal] =
    useState<TenantBrandingFormValues | null>(null);
  const [savingTab, setSavingTab] = useState<CompanySettingsTab | null>(null);

  const profileQuery = useQuery({
    queryKey: ["settings", "company"],
    queryFn: fetchCompanyProfile,
    enabled: user?.role === "company_admin",
  });

  const brandingQuery = useQuery({
    queryKey: ["settings", "branding", "overrides"],
    queryFn: fetchTenantBrandingOverrides,
    enabled: user?.role === "company_admin",
  });

  const countryDialCodesQuery = useQuery({
    queryKey: ["country-dial-codes"],
    queryFn: fetchCountryDialCodes,
    enabled: user?.role === "company_admin",
  });

  const dialCodeOptions = getUniqueDialCodes(
    countryDialCodesQuery.data?.countryDialCodes.map((country) => ({
      code: country.code,
      name: country.name,
      dialCode: country.dialCode,
      minNationalLength: country.minNationalLength,
      maxNationalLength: country.maxNationalLength,
    })) ?? [],
  );

  useEffect(() => {
    if (profileQuery.data) {
      const formValues = toProfileFormValues(profileQuery.data);
      setProfileValues(formValues);
      setProfileOriginal(formValues);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (brandingQuery.data) {
      const formValues = toBrandingFormValues(brandingQuery.data);
      setBrandingValues(formValues);
      setBrandingOriginal(formValues);
    }
  }, [brandingQuery.data]);

  const profileHasChanges = useMemo(() => {
    if (!profileValues || !profileOriginal) {
      return false;
    }
    return hasFormChanges(
      profileValues as unknown as Record<string, unknown>,
      profileOriginal as unknown as Record<string, unknown>,
      [...profileFormKeys],
    );
  }, [profileValues, profileOriginal]);

  const brandingHasChanges = useMemo(() => {
    if (!brandingValues || !brandingOriginal) {
      return false;
    }
    return hasFormChanges(brandingValues, brandingOriginal, [
      ...brandingFormKeys,
    ]);
  }, [brandingValues, brandingOriginal]);

  const profileMutation = useMutation({
    mutationFn: updateCompanyProfile,
    onSuccess: async (profile) => {
      toast.success("Company profile updated.");
      void queryClient.invalidateQueries({ queryKey: ["settings", "company"] });
      void queryClient.invalidateQueries({ queryKey: ["country-dial-codes"] });
      await refresh();
      const formValues = toProfileFormValues(profile);
      setProfileValues(formValues);
      setProfileOriginal(formValues);
      setSavingTab(null);
    },
    onError: (err) => {
      setSavingTab(null);
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update company profile",
      );
    },
  });

  const brandingMutation = useMutation({
    mutationFn: updateTenantBranding,
    onSuccess: async () => {
      toast.success("Company branding updated.");
      void queryClient.invalidateQueries({
        queryKey: ["settings", "branding"],
      });
      await refresh();
      const refreshed = await fetchTenantBrandingOverrides();
      const formValues = toBrandingFormValues(refreshed);
      setBrandingValues(formValues);
      setBrandingOriginal(formValues);
      setSavingTab(null);
    },
    onError: (err) => {
      setSavingTab(null);
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update company branding",
      );
    },
  });

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!profileValues || !profileOriginal || !profileHasChanges) {
      return;
    }
    setSavingTab("profile");
    profileMutation.mutate(toProfilePatchInput(profileValues, profileOriginal));
  };

  const handleBrandingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!brandingValues || !brandingOriginal || !brandingHasChanges) {
      return;
    }
    setSavingTab("branding");
    brandingMutation.mutate(
      toBrandingPatchInput(brandingValues, brandingOriginal),
    );
  };

  const handleClearBrandingField = (field: keyof TenantBrandingFormValues) => {
    setBrandingValues((prev) => (prev ? { ...prev, [field]: "" } : prev));
  };

  if (user?.role !== "company_admin") {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const isLoading =
    isAnyQueryInitialLoad(profileQuery, brandingQuery, countryDialCodesQuery) ||
    !profileValues ||
    !brandingValues;
  const isError =
    profileQuery.isError ||
    brandingQuery.isError ||
    countryDialCodesQuery.isError;

  if (isLoading) {
    return (
      <PageContainer>
        <p className="text-sm text-slate-500">Loading company settings…</p>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <p className="text-sm text-red-600">Failed to load company settings.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
        title="Company"
        description="Update your company profile and customize branding shown across the platform."
      />

      <CompanySettingsTabs
        dialCodeOptions={dialCodeOptions}
        profile={{
          values: profileValues,
          onChange: (field, value) =>
            setProfileValues((prev) =>
              prev ? { ...prev, [field]: value } : prev,
            ),
          onSubmit: handleProfileSubmit,
          loading: profileMutation.isPending && savingTab === "profile",
          hasChanges: profileHasChanges,
        }}
        branding={{
          values: brandingValues,
          displayName,
          onChange: (field, value) =>
            setBrandingValues((prev) =>
              prev ? { ...prev, [field]: value } : prev,
            ),
          onClearField: handleClearBrandingField,
          onSubmit: handleBrandingSubmit,
          loading: brandingMutation.isPending && savingTab === "branding",
          hasChanges: brandingHasChanges,
        }}
      />
    </PageContainer>
  );
};
