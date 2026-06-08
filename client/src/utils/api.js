const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export const fetchAPI = async (endpoint, options = {}) => {
  // Don't set Content-Type if body is FormData (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...options.headers
  };

  const response = await fetch(`${backendUrl}${endpoint}`, {
    ...options,
    headers
  });
  
  return response.json();
};

export { backendUrl };
