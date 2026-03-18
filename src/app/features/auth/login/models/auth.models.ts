import { Role } from 'src/app/core/models/User';

// auth/models/auth.models.ts
export type UserRole = 'admin' | 'proveedor' | 'turista';

export interface UserSession {
  id: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user?: UserSession; // Ahora opcional, lo sacaremos del JWT
}
