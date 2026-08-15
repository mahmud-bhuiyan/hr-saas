export const DEFAULT_MIN_NATIONAL_LENGTH = 7;
export const DEFAULT_MAX_NATIONAL_LENGTH = 11;
export const E164_MAX_TOTAL_DIGITS = 15;

export interface CountryDialCode {
  code: string;
  name: string;
  dialCode: string;
  minNationalLength?: number;
  maxNationalLength?: number;
}

export const DEFAULT_DIAL_CODE = "1";

export const getE164MaxNationalLength = (dialCode: string): number =>
  E164_MAX_TOTAL_DIGITS - dialCode.length;

export const getNationalLengthLimits = (
  dialCode: string,
  countries: CountryDialCode[],
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

export const getUniqueDialCodes = (
  countries: CountryDialCode[],
): CountryDialCode[] => {
  const byDialCode = new Map<string, CountryDialCode>();

  for (const country of countries) {
    const existing = byDialCode.get(country.dialCode);
    if (!existing) {
      byDialCode.set(country.dialCode, country);
      continue;
    }

    byDialCode.set(country.dialCode, {
      ...existing,
      minNationalLength: Math.min(
        existing.minNationalLength ?? DEFAULT_MIN_NATIONAL_LENGTH,
        country.minNationalLength ?? DEFAULT_MIN_NATIONAL_LENGTH,
      ),
      maxNationalLength: Math.max(
        existing.maxNationalLength ?? DEFAULT_MAX_NATIONAL_LENGTH,
        country.maxNationalLength ?? DEFAULT_MAX_NATIONAL_LENGTH,
      ),
    });
  }

  return Array.from(byDialCode.values()).sort(
    (a, b) => Number.parseInt(a.dialCode, 10) - Number.parseInt(b.dialCode, 10),
  );
};

export const sortDialCodesNumerically = (
  countries: CountryDialCode[],
): CountryDialCode[] =>
  [...countries].sort(
    (a, b) => Number.parseInt(a.dialCode, 10) - Number.parseInt(b.dialCode, 10),
  );

export const getDefaultDialCode = (
  countries: CountryDialCode[],
  tenantDefault?: string,
): string => {
  if (tenantDefault) {
    return tenantDefault;
  }

  if (typeof navigator !== "undefined") {
    const region = navigator.language.split("-")[1]?.toUpperCase();
    if (region) {
      const match = countries.find((country) => country.code === region);
      if (match) {
        return match.dialCode;
      }
    }
  }

  return countries[0]?.dialCode ?? DEFAULT_DIAL_CODE;
};

const sortDialCodesByLength = (
  countries: CountryDialCode[],
): CountryDialCode[] =>
  [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);

export const parsePhone = (
  value: string,
  countries: CountryDialCode[],
  fallbackDialCode = getDefaultDialCode(countries),
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

export const buildPhone = (
  dialCode: string,
  nationalNumber: string,
): string => {
  const national = nationalNumber.replace(/\D/g, "");
  if (!national) {
    return "";
  }

  return `+${dialCode}${national}`;
};

export const formatPhone = (
  value: string | undefined | null,
  countries: CountryDialCode[] = [],
  fallbackDialCode = getDefaultDialCode(countries),
): string => {
  if (!value?.trim()) {
    return "";
  }

  const { dialCode, nationalNumber } = parsePhone(
    value,
    countries,
    fallbackDialCode,
  );
  if (!nationalNumber) {
    return "";
  }

  return `+${dialCode} ${nationalNumber}`;
};
