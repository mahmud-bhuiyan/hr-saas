/**
 * Compare form values to original values and return only changed fields.
 * Empty strings and undefined are normalized for string comparison.
 */
export const pickChangedFields = <T extends Record<string, unknown>,>(
  current: T,
  original: T,
  keys: Array<keyof T>
): Partial<T> => {
  const changed: Partial<T> = {};

  for (const key of keys) {
    const currentValue = normalizeFieldValue(current[key]);
    const originalValue = normalizeFieldValue(original[key]);

    if (currentValue !== originalValue) {
      changed[key] = current[key];
    }
  }

  return changed;
}

export const hasFormChanges = <T extends Record<string, unknown>,>(
  current: T,
  original: T,
  keys: Array<keyof T>
): boolean => {
  return Object.keys(pickChangedFields(current, original, keys)).length > 0;
}

export const areRequiredFieldsFilled = <T extends Record<string, unknown>,>(
  values: T,
  requiredKeys: Array<keyof T>
): boolean => {
  return requiredKeys.every((key) => {
    const value = values[key];
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== undefined && value !== null;
  });
}

const normalizeFieldValue = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}
