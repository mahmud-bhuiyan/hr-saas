import { FormEvent } from "react";
import { HiLink, HiSquares2X2 } from "react-icons/hi2";
import { FormActions } from "../../../../components/ui/FormActions";
import { FormField } from "../../../../components/ui/FormField";
import { Select } from "../../../../components/ui/Select";
import {
  FAVICON_IMAGE_SIZE_HINT,
  LOGO_SHAPE_OPTIONS,
} from "../../../../constants/branding";
import type { LogoShape } from "../../../../types";
import { ImageAssetField } from "./ImageAssetField";
import type { SiteSettingsFormValues } from "../utils";

interface FaviconSettingsTabProps {
  values: SiteSettingsFormValues;
  onChange: (
    field: keyof SiteSettingsFormValues,
    value: string | number | boolean,
  ) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const FaviconSettingsTab = ({
  values,
  onChange,
  onSubmit,
  loading,
  hasChanges,
}: FaviconSettingsTabProps) => (
  <form
    onSubmit={(e) => void onSubmit(e)}
    className="card-surface space-y-6 p-6"
  >
    <ImageAssetField
      label="Favicon URL or upload"
      htmlFor="faviconUrl"
      asset="favicon"
      url={values.faviconUrl}
      onUrlChange={(value) => onChange("faviconUrl", value)}
      disabled={loading}
      icon={<HiLink className="h-4 w-4 text-brand-600" />}
      placeholder="https://example.com/favicon.ico"
      description={FAVICON_IMAGE_SIZE_HINT}
      saveHint="Upload crops to 64×64 PNG. Save to apply."
      previewShape={values.faviconShape}
    />

    <FormField label="Favicon shape" htmlFor="faviconShape">
      <Select
        id="faviconShape"
        value={values.faviconShape}
        onChange={(e) =>
          onChange("faviconShape", e.target.value as LogoShape)
        }
        icon={<HiSquares2X2 className="h-4 w-4 text-brand-600" />}
        disabled={loading}
      >
        {LOGO_SHAPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormField>

    <FormActions
      submitLabel="Save favicon settings"
      loading={loading}
      loadingText="Saving…"
      submitDisabled={!hasChanges || loading}
    />
  </form>
);
