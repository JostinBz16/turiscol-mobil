// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export interface Environment {
  production: boolean;
  apiUrl: string;
  chatWsUrl: string;
  googleMapsApiKey: string;
  mercadoPagoPublicKey: string;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://192.168.0.112:8080/api/v1',
  chatWsUrl: 'http://192.168.0.112:8809/ws/chat',
  googleMapsApiKey: 'AIzaSyCkX73molJA_XEREnfAYYrg8TL02Rekv2U',
  mercadoPagoPublicKey:
    'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',
};
