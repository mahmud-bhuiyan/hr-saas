import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  LogoShape,
  PatchCompanyProfileInput,
  PatchTenantBrandingInput,
  TenantBrandingOverrides,
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
import type {
  BrandingSaveStatus,
  TenantBrandingFormValues,
} from "./components/TenantBrandingForm";

const profileFormKeys = ["name", "address", "defaultPhoneDialCode"] as const;
const brandingFormKeys = [
  "logoUrl",
  "faviconUrl",
  "logoShape",
  "faviconShape",
] as const;

const BRANDING_AUTOSAVE_MS = 650;

const toProfileFormValues = (
  profile: CompanyProfile,
): CompanyProfileFormValues => ({
  name: profile.name,
  address: profile.address ?? "",
  defaultPhoneDialCode: profile.defaultPhoneDialCode,
});

const toBrandingFormValues = (
  overrides: TenantBrandingOverrides,
  platformLogoShape: LogoShape,
  platformFaviconShape: LogoShape,
): TenantBrandingFormValues => ({
  logoUrl: overrides.logoUrl ?? "",
  faviconUrl: overrides.faviconUrl ?? "",
  logoShape: overrides.logoShape ?? platformLogoShape,
  faviconShape: overrides.faviconShape ?? platformFaviconShape,
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
  if (changed.logoShape !== undefined) {
    input.logoShape = changed.logoShape as LogoShape;
  }
  if (changed.faviconShape !== undefined) {
    input.faviconShape = changed.faviconShape as LogoShape;
  }

  return input;
};

const mergeBrandingAfterSave = (
  prev: TenantBrandingFormValues,
  server: TenantBrandingFormValues,
  saved: PatchTenantBrandingInput,
): TenantBrandingFormValues => ({
  logoUrl: saved.logoUrl !== undefined ? server.logoUrl : prev.logoUrl,
  faviconUrl:
    saved.faviconUrl !== undefined ? server.faviconUrl : prev.faviconUrl,
  logoShape: saved.logoShape !== undefined ? server.logoShape : prev.logoShape,
  faviconShape:
    saved.faviconShape !== undefined ? server.faviconShape : prev.faviconShape,
});

export const CompanySettingsPage = () => {
  const { user } = useAuth();
  const { config, displayName, refresh } = useSiteConfig();
  const queryClient = useQueryClient();
  const [profileValues, setProfileValues] =
    useState<CompanyProfileFormValues | null>(null);
  const [profileOriginal, setProfileOriginal] =
    useState<CompanyProfileFormValues | null>(null);
  const [brandingValues, setBrandingValues] =
    useState<TenantBrandingFormValues | null>(null);
  const [brandingOriginal, setBrandingOriginal] =
    useState<TenantBrandingFormValues | null>(null);
  const [brandingSaveStatus, setBrandingSaveStatus] =
    useState<BrandingSaveStatus>("idle");
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const brandingHydratedRef = useRef(false);
  const savedStatusTimerRef = useRef<number | null>(null);

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
      const formValues = toBrandingFormValues(
        brandingQuery.data,
        config.logoDisplay.shape,
        config.faviconDisplay.shape,
      );
      setBrandingValues(formValues);
      setBrandingOriginal(formValues);
      brandingHydratedRef.current = true;
      setBrandingSaveStatus("idle");
    }
  }, [
    brandingQuery.data,
    config.logoDisplay.shape,
    config.faviconDisplay.shape,
  ]);

  useEffect(
    () => () => {
      if (savedStatusTimerRef.current) {
        window.clearTimeout(savedStatusTimerRef.current);
      }
    },
    [],
  );

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
      setProfileEditOpen(false);
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update company profile",
      );
    },
  });

  const brandingMutation = useMutation({
    mutationFn: updateTenantBranding,
    onSuccess: async (effective, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["settings", "branding"],
      });
      await refresh();
      const refreshed = await fetchTenantBrandingOverrides();
      const serverValues = toBrandingFormValues(
        refreshed,
        effective.logoDisplay.shape,
        effective.faviconDisplay.shape,
      );
      setBrandingOriginal(serverValues);
      setBrandingValues((prev) =>
        prev ? mergeBrandingAfterSave(prev, serverValues, variables) : serverValues,
      );
      setBrandingSaveStatus("saved");
      if (savedStatusTimerRef.current) {
        window.clearTimeout(savedStatusTimerRef.current);
      }
      savedStatusTimerRef.current = window.setTimeout(() => {
        setBrandingSaveStatus("idle");
      }, 1600);
    },
    onError: (err) => {
      setBrandingSaveStatus("error");
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update company branding",
      );
    },
  });

  useEffect(() => {
    if (!brandingHydratedRef.current || !brandingValues || !brandingOriginal) {
      return;
    }
    if (
      !hasFormChanges(brandingValues, brandingOriginal, [...brandingFormKeys])
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const input = toBrandingPatchInput(brandingValues, brandingOriginal);
      if (Object.keys(input).length === 0) {
        return;
      }
      setBrandingSaveStatus("saving");
      brandingMutation.mutate(input);
    }, BRANDING_AUTOSAVE_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mutate identity is unstable; values/original drive saves
  }, [brandingValues, brandingOriginal]);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!profileValues || !profileOriginal || !profileHasChanges) {
      return;
    }
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

  const handleClearBrandingField = (field: "logoUrl" | "faviconUrl") => {
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
        saveStatus={brandingSaveStatus}
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
          loading={profileMutation.isPending}
          hasChanges={profileHasChanges}
        />
      )}
    </PageContainer>
  );
};
