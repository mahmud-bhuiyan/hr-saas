import { useRef, useState } from 'react';
import { HiArrowUpTray, HiCheck, HiLink } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { ApiError, readFileAsBase64, uploadPlatformAsset } from '../../../../lib/api';
import { toast } from 'react-toastify';

interface ImageAssetFieldProps {
  label: string;
  htmlFor: string;
  asset: 'logo' | 'favicon';
  url: string;
  savedUrl: string;
  onUrlChange: (value: string) => void;
  onSave: (url: string) => Promise<void>;
  saving?: boolean;
  icon: React.ReactNode;
  placeholder: string;
}

export const ImageAssetField = ({
  label,
  htmlFor,
  asset,
  url,
  savedUrl,
  onUrlChange,
  onSave,
  saving = false,
  icon,
  placeholder,
}: ImageAssetFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const urlDirty = url.trim() !== savedUrl.trim();
  const busy = uploading || saving;

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
      await onSave(result.url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyUrl = async () => {
    try {
      await onSave(url.trim());
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Failed to save URL');
    }
  };

  return (
    <FormField label={label} htmlFor={htmlFor}>
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1">
            <Input
              id={htmlFor}
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder={placeholder}
              icon={icon}
              disabled={busy}
            />
          </div>
          {urlDirty && (
            <Button
              type="button"
              variant="secondary"
              icon={<HiCheck className="h-4 w-4 text-emerald-600" />}
              loading={saving && !uploading}
              loadingText="Saving…"
              disabled={busy || !url.trim()}
              onClick={() => void handleApplyUrl()}
              className="shrink-0"
            >
              Apply URL
            </Button>
          )}
        </div>
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
            loading={uploading || saving}
            loadingText={uploading ? 'Uploading…' : 'Saving…'}
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>
          {url && (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <img src={url} alt="" className="h-8 w-8 object-contain" />
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <HiLink className="h-3.5 w-3.5 text-brand-600" />
                Preview
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500">Upload saves automatically. Paste a URL and click Apply URL.</p>
      </div>
    </FormField>
  );
};
