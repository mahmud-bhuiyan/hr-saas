import {
  BrandAssetField,
  type BrandAssetFieldProps,
} from "../../../../components/BrandAssetField";
import type { BrandAssetShape } from "../../../../components/BrandAssetImage";
import { uploadPlatformAsset } from "../../../../lib/api";

interface ImageAssetFieldProps {
  label: string;
  htmlFor: string;
  asset: "logo" | "favicon";
  url: string;
  onUrlChange: (value: string) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  placeholder: string;
  saveHint?: string;
  previewShape?: BrandAssetShape;
  description?: BrandAssetFieldProps["description"];
  clearLabel?: string;
  onClear?: () => void;
}

/** Super-admin wrapper around BrandAssetField (platform ImgBB upload). */
export const ImageAssetField = ({
  label,
  htmlFor,
  asset,
  url,
  onUrlChange,
  disabled = false,
  icon,
  placeholder,
  saveHint = "Paste a URL or upload an image, then save to apply changes.",
  previewShape,
  description,
  clearLabel,
  onClear,
}: ImageAssetFieldProps) => (
  <BrandAssetField
    label={label}
    htmlFor={htmlFor}
    asset={asset}
    url={url}
    onUrlChange={onUrlChange}
    disabled={disabled}
    icon={icon}
    placeholder={placeholder}
    description={description}
    saveHint={saveHint}
    previewShape={previewShape}
    clearLabel={clearLabel}
    onClear={onClear}
    upload={uploadPlatformAsset}
  />
);
