import { forwardRef, useRef, type InputHTMLAttributes, type MutableRefObject, type ReactNode } from 'react';
import { HiDocumentArrowUp } from 'react-icons/hi2';

interface FileInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  error?: string;
  icon?: ReactNode;
  fileName?: string | null;
  placeholder?: string;
  onFileChange?: (file: File | null) => void;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
  (
    {
      error,
      icon,
      fileName,
      placeholder = 'Choose a file',
      onFileChange,
      accept,
      disabled,
      id,
      wrapperClassName = '',
      buttonClassName = '',
      className: _className,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null) as MutableRefObject<HTMLInputElement | null>;

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
        return;
      }

      if (ref) {
        (ref as MutableRefObject<HTMLInputElement | null>).current = node;
      }
    };

    const handleClick = () => {
      if (disabled) {
        return;
      }

      inputRef.current?.click();
    };

    return (
      <div className={wrapperClassName}>
        <input
          ref={setRefs}
          id={id}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(event) => {
            onFileChange?.(event.target.files?.[0] ?? null);
          }}
          {...props}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={handleClick}
          className={`flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-400 hover:bg-brand-50/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-brand-500 dark:hover:bg-brand-950/20 ${buttonClassName}`}
        >
          {icon ?? <HiDocumentArrowUp className="h-5 w-5 shrink-0 text-brand-600" />}
          <span className="min-w-0 truncate">{fileName || placeholder}</span>
        </button>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FileInput.displayName = 'FileInput';
