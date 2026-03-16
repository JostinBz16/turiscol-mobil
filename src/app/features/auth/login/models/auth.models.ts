import { Role } from 'src/app/core/models/User';

// auth/models/auth.models.ts
export type UserRole = 'admin' | 'proveedor' | 'turista';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
}
