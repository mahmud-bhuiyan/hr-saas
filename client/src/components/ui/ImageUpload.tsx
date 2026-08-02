import { useRef } from 'react';
import { HiArrowUpTray, HiTrash } from 'react-icons/hi2';
import { Button } from './Button';

const DEFAULT_ACCEPT = '.png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp';

interface ImageUploadProps {
  label?: string;
  imageUrl?: string | null;
  fallback?: React.ReactNode;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  uploading?: boolean;
  removing?: boolean;
  disabled?: boolean;
  shape?: 'circle' | 'rounded';
  accept?: string;
  hint?: string;
  previewClassName?: string;
}

export const ImageUpload = ({
  label = 'Profile photo',
  imageUrl,
  fallback,
  onUpload,
  onRemove,
  uploading = false,
  removing = false,
  disabled = false,
  shape = 'circle',
  accept = DEFAULT_ACCEPT,
  hint = 'PNG, JPEG, or WebP up to 1 MB. Upload saves automatically.',
  previewClassName = 'h-20 w-20',
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busy = uploading || removing || disabled;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      void onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 ${shapeClass} ${previewClassName}`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            fallback ?? (
              <span className="text-xs text-slate-400">No image</span>
            )
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={busy}
            onChange={(e) => handleFileChange(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            icon={<HiArrowUpTray className="h-4 w-4 text-brand-600" />}
            loading={uploading}
            loadingText="Uploading…"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload image
          </Button>
          {imageUrl && onRemove && (
            <Button
              type="button"
              variant="secondary"
              icon={<HiTrash className="h-4 w-4 text-red-500" />}
              loading={removing}
              loadingText="Removing…"
              disabled={busy}
              onClick={() => void onRemove()}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
};
