import { useQuery } from "@tanstack/react-query";
import { fetchCountryDialCodes } from "../lib/api";
import type { CountryDialCode } from "../utils/phone";
import {
  getDefaultDialCode,
  getUniqueDialCodes,
  sortDialCodesNumerically,
} from "../utils/phone";

export const useCountryDialCodes = () => {
  const query = useQuery({
    queryKey: ["country-dial-codes"],
    queryFn: () => fetchCountryDialCodes(),
    staleTime: 5 * 60 * 1000,
  });

  const countryDialCodes = query.data?.countryDialCodes ?? [];
  const activeCountryDialCodes = countryDialCodes.filter(
    (country) => !country.isArchived,
  );
  const dialCodeOptions = getUniqueDialCodes(
    activeCountryDialCodes.map((country) => ({
      code: country.code,
      name: country.name,
      dialCode: country.dialCode,
      minNationalLength: country.minNationalLength,
      maxNationalLength: country.maxNationalLength,
    })),
  );
  const allDialCodeOptions = sortDialCodesNumerically(
    activeCountryDialCodes.map((country) => ({
      code: country.code,
      name: country.name,
      dialCode: country.dialCode,
      minNationalLength: country.minNationalLength,
      maxNationalLength: country.maxNationalLength,
    })),
  );
  const defaultDialCode = getDefaultDialCode(
    dialCodeOptions,
    query.data?.defaultPhoneDialCode,
  );

  return {
    ...query,
    countryDialCodes,
    activeCountryDialCodes,
    dialCodeOptions,
    allDialCodeOptions,
    defaultDialCode,
  };
};

export const usePhoneDialCodeOptions = (): {
  dialCodeOptions: CountryDialCode[];
  allDialCodeOptions: CountryDialCode[];
  defaultDialCode: string;
  isLoading: boolean;
} => {
  const { dialCodeOptions, allDialCodeOptions, defaultDialCode, isLoading } =
    useCountryDialCodes();

  return {
    dialCodeOptions,
    allDialCodeOptions,
    defaultDialCode,
    isLoading,
  };
};
