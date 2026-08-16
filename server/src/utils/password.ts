import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/** Default password for admin one-click employee logins. */
export const DEFAULT_EMPLOYEE_LOGIN_PASSWORD = "User@123";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  passwordHash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, passwordHash);
};
