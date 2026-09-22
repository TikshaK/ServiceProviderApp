const trimValue = (value?: string) => (value ?? '').trim();

export const validateRequiredValue = (value: string) => trimValue(value).length > 0;

export const validatePhoneNumber = (value: string) => /^\d{10}$/.test(trimValue(value));

export const validatePassword = (value: string, minLength = 6) => {
  return value.length >= minLength && !/\s/.test(value);
};

export const validateFullName = (value: string, minLength = 2) => {
  return value === value.trim() && trimValue(value).length >= minLength;
};

export const validateEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimValue(value));
};

export const validateConfirmPassword = (password: string, confirmation: string) => {
  return validateRequiredValue(confirmation) && password === confirmation;
};

export const getRequiredError = (value: string, touched: boolean, label: string) => {
  if (!touched) return '';
  return validateRequiredValue(value) ? '' : `${label} is required`;
};

export const getPhoneError = (value: string, touched: boolean) => {
  if (!touched) return '';
  if (!validateRequiredValue(value)) return 'Phone number is required';
  return validatePhoneNumber(value) ? '' : 'Enter a valid 10-digit phone number';
};

export const getPasswordError = (value: string, touched: boolean) => {
  if (!touched) return '';
  if (!validateRequiredValue(value)) return 'Password is required';
  return validatePassword(value) ? '' : 'Password must be at least 6 characters without spaces';
};

export const getFullNameError = (value: string, touched: boolean) => {
  if (!touched) return '';
  if (!validateRequiredValue(value)) return 'Full name is required';
  return validateFullName(value) ? '' : 'Enter a valid full name';
};

export const getEmailError = (value: string, touched: boolean) => {
  if (!touched) return '';
  if (!validateRequiredValue(value)) return 'Email is required';
  return validateEmail(value) ? '' : 'Enter a valid email address';
};

export const getConfirmPasswordError = (password: string, confirmation: string, touched: boolean) => {
  if (!touched) return '';
  if (!validateRequiredValue(confirmation)) return 'Please confirm your password';
  return validateConfirmPassword(password, confirmation) ? '' : 'Passwords do not match';
};
