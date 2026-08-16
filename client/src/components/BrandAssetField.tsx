import { useRef, useState } from "react";
import { HiArrowUpTray } from "react-icons/hi2";
import { BrandAssetImage } from "./BrandAssetImage";
import { Button } from "./ui/Button";
import { FormField } from "./ui/FormField";
import { Input } from "./ui/Input";
import { ApiError } from "../lib/api";
import type {
  LogoShape,
  UploadPlatformAssetInput,
  UploadPlatformAssetResponse,
} from "../types";
import { normalizeBrandAssetFile } from "../utils/brand-asset-image";
import { toast } from "react-toastify";

const ACCEPT =
  ".png,.jpg,.jpeg,.webp,.svg,.ico,image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon";

export interface BrandAssetFieldProps {
  label: string;
  htmlFor: string;
  asset: "logo" | "favicon";
  url: string;
  onUrlChange: (value: string) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  placeholder: string;
  description?: React.ReactNode;
  saveHint?: string;
  previewShape?: LogoShape;
  previewSize?: number;
  previewMaxWidth?: number;
  clearLabel?: string;
  onClear?: () => void;
  /** Uploads normalized image bytes and returns a hosted URL. */
  upload: (
    input: UploadPlatformAssetInput,
  ) => Promise<UploadPlatformAssetResponse>;
}

export const BrandAssetField = ({
  label,
  htmlFor,
  asset,
  url,
  onUrlChange,
  disabled = false,
  icon,
  placeholder,
  description,
  saveHint = "Paste a URL or upload an image, then save to apply changes.",
  previewShape,
  previewSize,
  previewMaxWidth,
  clearLabel,
  onClear,
  upload,
}: BrandAssetFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const busy = uploading || disabled;
  const shape: LogoShape =
    previewShape ?? (asset === "favicon" ? "circle" : "default");
  // Form previews use one shared thumbnail size — not real logo/favicon display size.
  const size = previewSize ?? 48;
  const maxWidth = previewMaxWidth ?? size;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const normalized = await normalizeBrandAssetFile(file, asset);
      const result = await upload({
        asset,
        imageBase64: normalized.imageBase64,
        filename: normalized.filename,
      });
      onUrlChange(result.url);
      toast.success(
        asset === "favicon"
          ? "Favicon uploaded as a 64×64 square PNG."
          : "Logo uploaded and optimized.",
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <FormField label={label} htmlFor={htmlFor} description={description}>
      <div className="space-y-3">
        <Input
          id={htmlFor}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={placeholder}
          icon={icon}
          disabled={busy}
        />
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            icon={<HiArrowUpTray className="h-4 w-4" />}
            loading={uploading}
            loadingText="Uploading…"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>
          {url ? (
            <div className="flex items-center gap-3">
              <BrandAssetImage
                src={url}
                shape={shape}
                size={size}
                maxWidth={maxWidth}
                thumbnail
              />
              {onClear && clearLabel ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="text-sm text-brand-600 hover:text-brand-700"
                  disabled={busy}
                >
                  {clearLabel}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <p className="text-xs text-slate-500">{saveHint}</p>
      </div>
    </FormField>
  );
};
