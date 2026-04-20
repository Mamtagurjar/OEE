export type AuthMode = 'login' | 'signup';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface StoredUser {
  name: string;
  email: string;
  password: string;
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const USERS_STORAGE_KEY = 'ionic_demo_users';
const SESSION_STORAGE_KEY = 'ionic_demo_session_email';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const DEMO_USER: StoredUser = {
  name: 'Demo User',
  email: 'demo@gmail.com',
  password: 'demo@123',
};

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isStoredUser = (value: unknown): value is StoredUser => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  return (
    typeof entry.name === 'string' &&
    typeof entry.email === 'string' &&
    typeof entry.password === 'string'
  );
};

const withDemoUser = (users: StoredUser[]): StoredUser[] => {
  const filteredUsers = users.filter(
    (user) => normalizeEmail(user.email) !== normalizeEmail(DEMO_USER.email),
  );

  return [DEMO_USER, ...filteredUsers];
};

export const readUsers = (): StoredUser[] => {
  try {
    const rawValue = localStorage.getItem(USERS_STORAGE_KEY);
    if (!rawValue) {
      return [DEMO_USER];
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return [DEMO_USER];
    }

    const safeUsers = parsedValue
      .filter(isStoredUser)
      .map((user) => ({
        ...user,
        email: normalizeEmail(user.email),
      }));

    return safeUsers.length > 0 ? safeUsers : [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
};

export const writeUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(withDemoUser(users)));
};

export const initializeUsers = (): StoredUser[] => {
  const seededUsers = withDemoUser(readUsers());
  writeUsers(seededUsers);
  return seededUsers;
};

export const validateLogin = (
  data: LoginFormData,
): FieldErrors<keyof LoginFormData> => {
  const errors: FieldErrors<keyof LoginFormData> = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  }

  return errors;
};

export const validateSignup = (
  data: SignupFormData,
  users: StoredUser[],
): FieldErrors<keyof SignupFormData> => {
  const errors: FieldErrors<keyof SignupFormData> = {};

  if (!data.fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Name should be at least 3 characters.';
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (
    users.some((user) => normalizeEmail(user.email) === normalizeEmail(data.email))
  ) {
    errors.email = 'This email is already registered. Please login.';
  }

  if (!data.password) {
    errors.password = 'Password is required.';
  } else if (!PASSWORD_PATTERN.test(data.password)) {
    errors.password =
      'Use 8+ chars with letter, number, and one special character.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export const validateForgotPassword = (
  data: ForgotPasswordFormData,
  users: StoredUser[],
): FieldErrors<keyof ForgotPasswordFormData> => {
  const errors: FieldErrors<keyof ForgotPasswordFormData> = {};

  if (!data.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  } else if (
    !users.some((user) => normalizeEmail(user.email) === normalizeEmail(data.email))
  ) {
    errors.email = 'No account found with this email.';
  }

  if (!data.password) {
    errors.password = 'New password is required.';
  } else if (!PASSWORD_PATTERN.test(data.password)) {
    errors.password =
      'Use 8+ chars with letter, number, and one special character.';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password.';
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export const setSessionEmail = (email: string): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, normalizeEmail(email));
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getSessionEmail = (): string | null => {
  const rawValue = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  return normalizeEmail(rawValue);
};

export const getActiveUser = (): StoredUser | null => {
  const sessionEmail = getSessionEmail();
  if (!sessionEmail) {
    return null;
  }

  const users = withDemoUser(readUsers());
  return users.find((user) => normalizeEmail(user.email) === sessionEmail) ?? null;
};

export type LoginResult =
  | { ok: true; user: StoredUser }
  | { ok: false; message: string };

export const loginUser = (data: LoginFormData): LoginResult => {
  const users = initializeUsers();
  const normalizedEmail = normalizeEmail(data.email);
  const matchedUser = users.find((user) => user.email === normalizedEmail);

  if (!matchedUser || matchedUser.password !== data.password) {
    return {
      ok: false,
      message: 'Invalid credentials. Please check your email and password.',
    };
  }

  setSessionEmail(matchedUser.email);
  return { ok: true, user: matchedUser };
};

export type SignupResult =
  | { ok: true; user: StoredUser }
  | { ok: false; message: string };

export const signupUser = (data: SignupFormData): SignupResult => {
  const users = initializeUsers();
  const errors = validateSignup(data, users);

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please fix the highlighted signup fields.' };
  }

  const newUser: StoredUser = {
    name: data.fullName.trim(),
    email: normalizeEmail(data.email),
    password: data.password,
  };

  writeUsers([...users, newUser]);

  return { ok: true, user: newUser };
};

export type ForgotPasswordResult =
  | { ok: true }
  | { ok: false; message: string };

export const resetPassword = (data: ForgotPasswordFormData): ForgotPasswordResult => {
  const users = initializeUsers();
  const errors = validateForgotPassword(data, users);

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: 'Please fix the highlighted fields.' };
  }

  const normalizedEmail = normalizeEmail(data.email);
  const userIndex = users.findIndex((user) => user.email === normalizedEmail);

  if (userIndex === -1) {
    return { ok: false, message: 'Account not found. Please check your email.' };
  }

  users[userIndex].password = data.password;
  writeUsers(users);

  return { ok: true };
};
