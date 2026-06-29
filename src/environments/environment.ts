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
  apiUrl: 'http://192.168.1.13:8080/api/v1',
  googleMapsApiKey: 'AIzaSyCkX73molJA_XEREnfAYYrg8TL02Rekv2U',
};
