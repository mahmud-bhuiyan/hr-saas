export const reportFormValidity = (form: HTMLFormElement): boolean => {
  if (form.checkValidity()) {
    return true;
  }

  form.reportValidity();
  return false;
};

export const reportInputValidity = (
  input: HTMLInputElement | null | undefined,
  message: string
): boolean => {
  if (!input) {
    return false;
  }

  input.setCustomValidity(message);
  const valid = input.reportValidity();

  if (!valid) {
    input.focus();
  }

  return valid;
};

export const clearInputValidity = (input: HTMLInputElement | null | undefined): void => {
  if (input) {
    input.setCustomValidity('');
  }
};
