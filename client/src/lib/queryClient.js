import { QueryClient } from '@tanstack/react-query';

// Function to check if a response is OK and throw if not
async function throwIfResNotOk(res) {
  if (!res.ok) {
    let error;
    try {
      const data = await res.json();
      error = new Error(data.message || 'Request failed');
      error.statusCode = res.status;
      error.data = data;
    } catch (_) {
      error = new Error(`Request failed with status ${res.status}`);
      error.statusCode = res.status;
    }
    throw error;
  }
}

// General API request function for reuse
export async function apiRequest(
  url,
  options = {}
) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  await throwIfResNotOk(res);
  return await res.json();
}

// Helper to create query functions
export const getQueryFn = (options) => {
  return async ({ queryKey }) => {
    const [url, params] = queryKey;
    try {
      const queryParams = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      return await apiRequest(`${url}${queryParams}`);
    } catch (err) {
      if (err.statusCode === 401 && options.on401 === 'throw') {
        throw err;
      }
      if (err.statusCode === 401 && options.on401 === 'returnNull') {
        return null;
      }
      throw err;
    }
  };
};

// Create and export the query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});