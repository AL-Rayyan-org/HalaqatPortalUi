// Login request
export interface LoginCredentials {
  email: string;
  password: string;
}

// Reset password begin request
export interface ResetPasswordBeginRequest {
  address: string;
}

// Reset password verify request
export interface ResetPasswordVerifyRequest {
  address: string;
  code: string;
}

// Reset password commit request
export interface ResetPasswordCommitRequest {
  token: string;
  newPassword: string;
}