interface Environment {
  production: boolean;
  apiUrl: string;
  googleMapsApiKey: string;
  mercadoPagoPublicKey: string;
}

export const environment: Environment = {
  production: true,
  apiUrl: 'https://api.turiscol.com/api/v1',
  googleMapsApiKey: 'AIzaSyCkX73molJA_XEREnfAYYrg8TL02Rekv2U',
  mercadoPagoPublicKey: 'APP_USR-0000000000000000-000000-00000000000000000000000000000000-000000000',
};
