import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PageContainer } from "../../../../components/ui/PageContainer";
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
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { CompanyProfileCards } from "./components/CompanyProfileCards";
import { CompanyProfileEditModal } from "./components/CompanyProfileEditModal";
import type { CompanyProfileFormValues } from "./components/CompanyProfileEditModal";
import { TenantBrandingForm } from "./components/TenantBrandingForm";
import type { TenantBrandingFormValues } from "./components/TenantBrandingForm";

const profileFormKeys = ["name", "address", "defaultPhoneDialCode"] as const;
const brandingFormKeys = ["logoUrl", "faviconUrl"] as const;

type SavingSection = "profile" | "branding" | null;

const toProfileFormValues = (
  profile: CompanyProfile,
): CompanyProfileFormValues => ({
  name: profile.name,
  address: profile.address ?? "",
  defaultPhoneDialCode: profile.defaultPhoneDialCode,
});

const toBrandingFormValues = (overrides: {
  logoUrl: string | null;
  faviconUrl: string | null;
}): TenantBrandingFormValues => ({
  logoUrl: overrides.logoUrl ?? "",
  faviconUrl: overrides.faviconUrl ?? "",
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
  if (changed.faviconUrl !== undefined) {
    input.faviconUrl = String(changed.faviconUrl) || null;
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
  const [savingSection, setSavingSection] = useState<SavingSection>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

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
      setSavingSection(null);
      setProfileEditOpen(false);
    },
    onError: (err) => {
      setSavingSection(null);
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
      setSavingSection(null);
    },
    onError: (err) => {
      setSavingSection(null);
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
    setSavingSection("profile");
    profileMutation.mutate(toProfilePatchInput(profileValues, profileOriginal));
  };

  const handleOpenProfileEdit = () => {
    if (profileOriginal) {
      setProfileValues(profileOriginal);
    }
    setProfileEditOpen(true);
  };

  const handleCloseProfileEdit = () => {
    setProfileEditOpen(false);
    if (profileOriginal) {
      setProfileValues(profileOriginal);
    }
  };

  const handleBrandingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!brandingValues || !brandingOriginal || !brandingHasChanges) {
      return;
    }
    setSavingSection("branding");
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
    !profileOriginal ||
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
        title="Company profile"
        description="Update your company name, address, phone country code, logo, and favicon."
      />

      <CompanyProfileCards
        values={profileOriginal}
        dialCodeOptions={dialCodeOptions}
        onEdit={handleOpenProfileEdit}
      />

      <TenantBrandingForm
        values={brandingValues}
        displayName={displayName}
        onChange={(field, value) =>
          setBrandingValues((prev) =>
            prev ? { ...prev, [field]: value } : prev,
          )
        }
        onClearField={handleClearBrandingField}
        onSubmit={handleBrandingSubmit}
        loading={brandingMutation.isPending && savingSection === "branding"}
        hasChanges={brandingHasChanges}
      />

      {profileValues && (
        <CompanyProfileEditModal
          open={profileEditOpen}
          onClose={handleCloseProfileEdit}
          values={profileValues}
          dialCodeOptions={dialCodeOptions}
          onChange={(field, value) =>
            setProfileValues((prev) =>
              prev ? { ...prev, [field]: value } : prev,
            )
          }
          onSubmit={handleProfileSubmit}
          loading={profileMutation.isPending && savingSection === "profile"}
          hasChanges={profileHasChanges}
        />
      )}
    </PageContainer>
  );
};
