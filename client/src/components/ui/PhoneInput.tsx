import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { usePhoneDialCodeOptions } from "../../hooks/useCountryDialCodes";
import { PhoneDialCodeSelect } from "./PhoneDialCodeSelect";
import {
  buildPhone,
  getDefaultDialCode,
  getNationalLengthLimits,
  parsePhone,
} from "../../utils/phone";

interface PhoneInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "type"
> {
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      error,
      className = "",
      id,
      icon,
      wrapperClassName = "",
      value,
      onChange,
      disabled,
      placeholder = "Phone number",
      ...props
    },
    ref,
  ) => {
    const { dialCodeOptions, allDialCodeOptions, defaultDialCode, isLoading } =
      usePhoneDialCodeOptions();
    const fallbackDialCode = useMemo(
      () => getDefaultDialCode(dialCodeOptions, defaultDialCode),
      [dialCodeOptions, defaultDialCode],
    );
    const { dialCode: parsedDialCode, nationalNumber } = parsePhone(
      value,
      dialCodeOptions,
      fallbackDialCode,
    );
    const [dialCodeOverride, setDialCodeOverride] = useState<string | null>(
      null,
    );
    const dialCode = value.trim()
      ? parsedDialCode
      : (dialCodeOverride ?? fallbackDialCode);
    const { min: minNationalLength, max: maxNationalLength } = useMemo(
      () => getNationalLengthLimits(dialCode, dialCodeOptions),
      [dialCode, dialCodeOptions],
    );

    useEffect(() => {
      if (!value.trim()) {
        setDialCodeOverride(null);
      }
    }, [value]);

    const emitChange = (nextDialCode: string, nextNationalNumber: string) => {
      onChange(buildPhone(nextDialCode, nextNationalNumber));
    };

    const handleDialCodeChange = (nextDialCode: string) => {
      if (!value.trim()) {
        setDialCodeOverride(nextDialCode);
      }
      emitChange(nextDialCode, nationalNumber);
    };

    const handleNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value
        .replace(/\D/g, "")
        .slice(0, maxNationalLength);
      emitChange(dialCode, digits);
    };

    const fieldClassName = `relative flex w-full items-center gap-1 rounded-lg border bg-white py-2.5 pl-2 pr-3 text-sm shadow-sm transition focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 ${
      error
        ? "border-red-300 focus-within:border-red-500 focus-within:ring-red-500 dark:border-red-500/60"
        : "border-slate-300 focus-within:border-brand-500"
    }`;

    const inputClassName = `min-w-0 flex-1 border-0 bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 ${className}`;

    return (
      <div className={`w-full min-w-0 ${wrapperClassName}`}>
        <div className={fieldClassName}>
          {icon && (
            <span
              className="pointer-events-none shrink-0 text-slate-400"
              aria-hidden
            >
              {icon}
            </span>
          )}
          <PhoneDialCodeSelect
            value={dialCode}
            options={allDialCodeOptions}
            disabled={disabled || isLoading || allDialCodeOptions.length === 0}
            onChange={handleDialCodeChange}
          />
          <span
            className="h-5 w-px shrink-0 bg-slate-200 dark:bg-slate-600"
            aria-hidden
          />
          <input
            ref={ref}
            id={id}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={nationalNumber}
            disabled={disabled}
            placeholder={placeholder}
            onChange={handleNumberChange}
            maxLength={maxNationalLength}
            className={inputClassName}
            {...props}
          />
        </div>
        {!error && maxNationalLength > 0 && (
          <p className="mt-1 text-xs text-slate-500">
            Enter{" "}
            {minNationalLength === maxNationalLength
              ? `${maxNationalLength} digits`
              : `${minNationalLength}–${maxNationalLength} digits`}{" "}
            after +{dialCode}
          </p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";
