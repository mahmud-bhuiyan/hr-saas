import { HiGlobeAlt, HiPhoto, HiSquares2X2 } from "react-icons/hi2";
import { BrandAssetField } from "../../../../../components/BrandAssetField";
import { FormField } from "../../../../../components/ui/FormField";
import { Select } from "../../../../../components/ui/Select";
import {
  FAVICON_IMAGE_SIZE_HINT,
  LOGO_IMAGE_SIZE_HINT,
  LOGO_SHAPE_OPTIONS,
} from "../../../../../constants/branding";
import { uploadTenantBrandingAsset } from "../../../../../lib/api";
import type { LogoShape } from "../../../../../types";

export type BrandingSaveStatus = "idle" | "saving" | "saved" | "error";

export interface TenantBrandingFormValues extends Record<string, unknown> {
  logoUrl: string;
  faviconUrl: string;
  logoShape: LogoShape;
  faviconShape: LogoShape;
}

interface TenantBrandingFormProps {
  values: TenantBrandingFormValues;
  displayName: string;
  onChange: (
    field: keyof TenantBrandingFormValues,
    value: string | LogoShape,
  ) => void;
  onClearField: (field: "logoUrl" | "faviconUrl") => void;
  saveStatus: BrandingSaveStatus;
}

const saveStatusLabel = (status: BrandingSaveStatus): string | null => {
  if (status === "saving") {
    return "Saving…";
  }
  if (status === "saved") {
    return "Saved";
  }
  if (status === "error") {
    return "Save failed";
  }
  return null;
};

export const TenantBrandingForm = ({
  values,
  onChange,
  onClearField,
  saveStatus,
}: TenantBrandingFormProps) => {
  const statusText = saveStatusLabel(saveStatus);

  return (
    <div className="card-surface space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Override the platform logo and favicon for your company. Paste a URL
          or upload an image — changes save automatically. Clear a URL to revert
          that asset to the platform default.
        </p>
        {statusText ? (
          <p
            className={`shrink-0 text-sm font-medium ${
              saveStatus === "error"
                ? "text-red-600"
                : saveStatus === "saved"
                  ? "text-emerald-600"
                  : "text-slate-500"
            }`}
          >
            {statusText}
          </p>
        ) : null}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="space-y-4">
          <BrandAssetField
            label="Logo"
            htmlFor="logoUrl"
            asset="logo"
            url={values.logoUrl}
            onUrlChange={(value) => onChange("logoUrl", value)}
            icon={<HiPhoto className="h-4 w-4 text-brand-600" />}
            placeholder="https://example.com/company-logo.png"
            description={LOGO_IMAGE_SIZE_HINT}
            saveHint="Upload optimizes to PNG. Autosaves."
            previewShape={values.logoShape}
            clearLabel="Clear logo override"
            onClear={() => onClearField("logoUrl")}
            upload={uploadTenantBrandingAsset}
          />

          <FormField label="Logo shape" htmlFor="logoShape">
            <Select
              id="logoShape"
              value={values.logoShape}
              onChange={(e) =>
                onChange("logoShape", e.target.value as LogoShape)
              }
              icon={<HiSquares2X2 className="h-4 w-4 text-brand-600" />}
            >
              {LOGO_SHAPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="space-y-4">
          <BrandAssetField
            label="Favicon"
            htmlFor="faviconUrl"
            asset="favicon"
            url={values.faviconUrl}
            onUrlChange={(value) => onChange("faviconUrl", value)}
            icon={<HiGlobeAlt className="h-4 w-4 text-brand-600" />}
            placeholder="https://example.com/favicon.ico"
            description={FAVICON_IMAGE_SIZE_HINT}
            saveHint="Upload crops to 64×64 PNG. Autosaves."
            previewShape={values.faviconShape}
            clearLabel="Clear favicon override"
            onClear={() => onClearField("faviconUrl")}
            upload={uploadTenantBrandingAsset}
          />

          <FormField label="Favicon shape" htmlFor="faviconShape">
            <Select
              id="faviconShape"
              value={values.faviconShape}
              onChange={(e) =>
                onChange("faviconShape", e.target.value as LogoShape)
              }
              icon={<HiSquares2X2 className="h-4 w-4 text-brand-600" />}
            >
              {LOGO_SHAPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </div>
    </div>
  );
};
