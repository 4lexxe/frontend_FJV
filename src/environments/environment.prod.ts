export const environment = {
  production: import.meta.env?.['VITE_PRODUCTION'] === 'true' || true,
  apiUrl: import.meta.env?.['VITE_API_URL'] || 'https://backend-fjv.onrender.com/api',
  frontendUrl: import.meta.env?.['VITE_FRONTEND_URL'] || 'https://frontend-fjv.vercel.app'
};
