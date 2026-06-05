import { Role } from 'src/app/core/models/User';

// auth/models/auth.models.ts
export type UserRole = 'admin' | 'proveedor' | 'turista';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
  userName?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  userName?: string;
  user?: UserSession;
}
