const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface ApiClientOptions extends RequestInit {
  data?: any;
}

async function apiClient<T = any>(endpoint: string, { data, headers: customHeaders, ...customConfig }: ApiClientOptions = {}): Promise<T> {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: data ? 'POST' : 'GET', // Par défaut POST si data, sinon GET
    ...customConfig,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: response.statusText }));
    // Lève une erreur structurée que nous pouvons attraper dans les composants
    const error = new Error(errorData.detail || 'Une erreur API est survenue') as any;
    error.response = response;
    error.data = errorData;
    throw error;
  }

  // Si la réponse est 204 No Content (ex: pour DELETE), retourner null ou un objet vide
  if (response.status === 204) {
    return Promise.resolve(null as unknown as T); 
  }

  return response.json() as Promise<T>;
}

// Exemples d'utilisation (peuvent être exportés directement ou via des fonctions spécifiques)
// apiClient.get = <T = any>(endpoint: string, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'GET' });
// apiClient.post = <T = any>(endpoint: string, data: any, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'POST', data });
// apiClient.put = <T = any>(endpoint: string, data: any, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'PUT', data });
// apiClient.delete = <T = any>(endpoint: string, options?: ApiClientOptions) => apiClient<T>(endpoint, { ...options, method: 'DELETE' });

export default apiClient; 