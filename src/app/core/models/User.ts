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
}

export interface UserApi {
  id: string;
  email: string;
  userName: string;
  phoneNumber: string;
  active: boolean;
  role: 'ADMIN' | 'PROVIDER' | 'CONSUMER';
}

export type Role = 'turista' | 'proveedor' | 'admin';
