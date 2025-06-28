const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://fiscal-ia-backend.up.railway.app';

interface ApiClientOptions extends RequestInit {
  data?: any;
}

// Ajout d'un utilitaire pour construire proprement l'URL et éviter les doublons `/api`
const buildUrl = (endpoint: string): string => {
  let base = API_BASE_URL || '';
  // Supprimer les barres obliques finales du base URL
  base = base.replace(/\/+$/, '');

  // S'assurer que l'endpoint commence par une barre oblique
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  /*
    Cas fréquent : l'env var contient déjà "api" (ex. https://fiscal-ia.net/api)
    et les composants appellent également un chemin commençant par "api/...".
    On détecte alors le doublon "api/api/" et on le corrige.
  */
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.slice(4); // retire le premier "/api"
  }

  return `${base}${cleanEndpoint}`;
};

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

  const response = await fetch(buildUrl(endpoint), config);

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