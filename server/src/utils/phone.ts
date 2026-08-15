import {
  DEFAULT_MAX_NATIONAL_LENGTH,
  DEFAULT_MIN_NATIONAL_LENGTH,
  E164_MAX_TOTAL_DIGITS,
} from "../constants/phone.js";

export interface CountryDialCodeRule {
  code: string;
  name: string;
  dialCode: string;
  minNationalLength?: number;
  maxNationalLength?: number;
}

export const getE164MaxNationalLength = (dialCode: string): number =>
  E164_MAX_TOTAL_DIGITS - dialCode.length;

export const getNationalLengthLimits = (
  dialCode: string,
  countries: CountryDialCodeRule[],
): { min: number; max: number } => {
  const matches = countries.filter((country) => country.dialCode === dialCode);
  const minConfigured =
    matches.length > 0
      ? Math.min(
          ...matches.map(
            (country) =>
              country.minNationalLength ?? DEFAULT_MIN_NATIONAL_LENGTH,
          ),
        )
      : DEFAULT_MIN_NATIONAL_LENGTH;
  const maxConfigured =
    matches.length > 0
      ? Math.max(
          ...matches.map(
            (country) =>
              country.maxNationalLength ?? DEFAULT_MAX_NATIONAL_LENGTH,
          ),
        )
      : DEFAULT_MAX_NATIONAL_LENGTH;
  const e164Max = getE164MaxNationalLength(dialCode);

  return {
    min: minConfigured,
    max: Math.min(maxConfigured, e164Max),
  };
};

const sortDialCodesByLength = (
  countries: CountryDialCodeRule[],
): CountryDialCodeRule[] =>
  [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);

export const parsePhone = (
  value: string,
  countries: CountryDialCodeRule[],
  fallbackDialCode: string,
): { dialCode: string; nationalNumber: string } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { dialCode: fallbackDialCode, nationalNumber: "" };
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) {
    return { dialCode: fallbackDialCode, nationalNumber: "" };
  }

  if (trimmed.startsWith("+")) {
    for (const country of sortDialCodesByLength(countries)) {
      if (digits.startsWith(country.dialCode)) {
        return {
          dialCode: country.dialCode,
          nationalNumber: digits.slice(country.dialCode.length),
        };
      }
    }
  }

  return { dialCode: fallbackDialCode, nationalNumber: digits };
};

export const validatePhoneNationalLength = (
  phone: string,
  countries: CountryDialCodeRule[],
  fallbackDialCode: string,
): string | null => {
  const trimmed = phone.trim();
  if (!trimmed) {
    return "Phone is required";
  }

  const { dialCode, nationalNumber } = parsePhone(
    trimmed,
    countries,
    fallbackDialCode,
  );
  const nationalDigits = nationalNumber.replace(/\D/g, "");

  if (!nationalDigits) {
    return "Phone number is required";
  }

  const activeDialCode = countries.some(
    (country) => country.dialCode === dialCode,
  );
  if (!activeDialCode) {
    return "Phone country code is not supported";
  }

  const { min, max } = getNationalLengthLimits(dialCode, countries);

  if (nationalDigits.length < min) {
    return `Phone number must be at least ${min} digits for +${dialCode}`;
  }

  if (nationalDigits.length > max) {
    return `Phone number must be at most ${max} digits for +${dialCode}`;
  }

  return null;
};
