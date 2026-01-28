export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phone: string;
  active: boolean;
  role: 'turista' | 'admin' | 'proveedor';
}

export interface UserApi {
  id: string;
  email: string;
  name: string;
  lastName: string;
  phoneNumber: string;
  active: boolean;
  role: 'ADMIN' | 'PROVIDER' | 'CONSUMER';
}

export type Role = 'turista' | 'proveedor' | 'admin';
