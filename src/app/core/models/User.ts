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

export type Role = 'turista' | 'proveedor' | 'admin';
