// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export interface Environment {
  production: boolean;
  apiUrl: string;
  googleMapsApiKey: string;
}

export const environment: Environment = {
  production: false,
  apiUrl: 'http://172.28.96.1:8080/api/v1',
  googleMapsApiKey: 'AIzaSyCkX73molJA_XEREnfAYYrg8TL02Rekv2U',
};