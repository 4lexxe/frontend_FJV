export const environment = {
  production: import.meta.env?.['VITE_PRODUCTION'] === 'true' || true,
  apiUrl: import.meta.env?.['VITE_API_URL'],
  frontendUrl: import.meta.env?.['VITE_FRONTEND_URL']
};
