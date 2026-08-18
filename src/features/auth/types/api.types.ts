export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface AuthResponseData {
  accessToken: string;
  expiresIn: number;
  refreshToken?: string;
  user?: Record<string, unknown>;
}

export interface AuthResponse {
  success: boolean;
  data: AuthResponseData;
  message?: string;
}
