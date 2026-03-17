export interface BaseRegisterRequest {
  userName: string;
  email: string;
  password: string;
  roles: string[];
  phoneNumber?: string;
  userType: 'TOURIST' | 'PROVIDER';
  active: boolean;
}

export interface TouristRegisterRequest extends BaseRegisterRequest {
  userType: 'TOURIST';
}

export interface ProviderRegisterRequest extends BaseRegisterRequest {
  userType: 'PROVIDER';
  type: 'COMPANY' | 'NATURAL_PERSON';
  razonSocial: string;
  description?: string;
  nitRut: string;
  website?: string;
}

export type RegisterRequestDTO = TouristRegisterRequest | ProviderRegisterRequest;
