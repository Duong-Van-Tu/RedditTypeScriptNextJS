import { RegisterInput } from '../types/RegisterInput';

export const validateResgisterInput = (registerinput: RegisterInput) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!registerinput.email.includes('@'))
    return {
      message: 'INvalid email address',
      error: [{ field: 'email', message: 'Email must include @ symbol' }],
    };

  if (registerinput.username.length <= 2)
    return {
      message: 'Invalid username',
      error: [
        {
          field: 'username',
          message: 'Username must be at least 2 characters',
        },
      ],
    };

  if (!registerinput.username.match(usernameRegex)) {
    return {
      message: 'Invalid username',
      errors: [
        {
          field: 'username',
          message: 'Username should only contains alphanumeric characters',
        },
      ],
    };
  }

  return null;
};
