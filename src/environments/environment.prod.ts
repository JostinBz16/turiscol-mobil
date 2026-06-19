interface Environment {
  production: boolean;
  apiUrl: string;
  googleMapsApiKey: string;
}

export const environment: Environment = {
  production: true,
  apiUrl: 'https://api.turiscol.com/api/v1',
  googleMapsApiKey: '',
};
