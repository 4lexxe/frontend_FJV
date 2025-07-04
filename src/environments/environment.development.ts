export const environment = {
  production: import.meta.env?.['VITE_PRODUCTION'] === 'true' || false,
  apiUrl: import.meta.env?.['VITE_API_URL'],
  frontendUrl: import.meta.env?.['VITE_FRONTEND_URL'] || 'http://localhost:4200'
};
