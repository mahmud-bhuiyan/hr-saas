import type { CountryDialCodeRecord } from "../../../types";

export const COUNTRY_CODES_BASE_PATH = "/country-codes";
export const COUNTRY_CODES_ACTIVE_PATH = "/country-codes/active";
export const COUNTRY_CODES_ARCHIVED_PATH = "/country-codes/archived";

export type CountryCodesListVariant = "active" | "archived";

export const formatNationalLength = (
  country: CountryDialCodeRecord,
): string => {
  return country.minNationalLength === country.maxNationalLength
    ? `${country.maxNationalLength}`
    : `${country.minNationalLength}–${country.maxNationalLength}`;
};

export const matchesCountryDialCodeSearch = (
  country: CountryDialCodeRecord,
  query: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const haystack = [
    country.name,
    country.code,
    country.dialCode,
    `+${country.dialCode}`,
    formatNationalLength(country),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
};
