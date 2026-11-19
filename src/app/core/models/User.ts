export interface User {
  id: string;
  email: string;
  userName: string;
  phoneNumber: string;
  active: boolean;
  role: 'turista' | 'admin' | 'proveedor';
  // Provider fields
  type?: 'COMPANY' | 'NATURAL_PERSON';
  razonSocial?: string;
  description?: string;
  nitRut?: string;
  website?: string;
  documentType?: string;
  documentNumber?: string;
  bankName?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  onboardingCompleted?: boolean;
}

export interface UserApi {
  id: string;
  email: string;
  userName: string;
  phoneNumber: string;
  active: boolean;
  role: 'ADMIN' | 'PROVIDER' | 'CONSUMER';
}

// Respuesta de GET /users/stats (api-documentation.md).
export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
}

export type Role ='turista' | 'proveedor' | 'admin';

// Rol de realm de Keycloak (api-documentation.md:253) — distinto del campo
// `role` de UserApi ('ADMIN'/'PROVIDER'/'CONSUMER'), que es el rol de negocio
// devuelto por UserResponseDTO. El realm usa 'USER' en vez de 'CONSUMER'.
export type RealmRole = 'USER' | 'PROVIDER' | 'ADMIN';
