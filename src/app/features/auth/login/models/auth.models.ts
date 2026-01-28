// auth/models/auth.models.ts
export type UserRole = 'admin' | 'proveedor' | 'turista';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}
