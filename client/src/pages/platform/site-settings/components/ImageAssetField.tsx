import { useRef, useState } from 'react';
import { HiArrowUpTray, HiLink } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { FaviconImage } from '../../../../components/FaviconImage';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { ApiError, readFileAsBase64, uploadPlatformAsset } from '../../../../lib/api';
import { toast } from 'react-toastify';

interface ImageAssetFieldProps {
  label: string;
  htmlFor: string;
  asset: 'logo' | 'favicon';
  url: string;
  onUrlChange: (value: string) => void;
  disabled?: boolean;
  icon: React.ReactNode;
  placeholder: string;
  saveHint?: string;
}

export const ImageAssetField = ({
  label,
  htmlFor,
  asset,
  url,
  onUrlChange,
  disabled = false,
  icon,
  placeholder,
  saveHint = 'Paste a URL or upload an image, then save to apply changes.',
}: ImageAssetFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const busy = uploading || disabled;

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const imageBase64 = await readFileAsBase64(file);
      const result = await uploadPlatformAsset({
        asset,
        imageBase64,
        filename: file.name,
      });
      onUrlChange(result.url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <FormField label={label} htmlFor={htmlFor}>
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
            accept=".png,.jpg,.jpeg,.webp,.svg,.ico,image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon"
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
          {url && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <FaviconImage src={url} className="h-8 w-8" />
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <HiLink className="h-3.5 w-3.5 text-brand-600" />
                Preview
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">{saveHint}</p>
      </div>
    </FormField>
  );
};
