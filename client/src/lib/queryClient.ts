import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Determine the base API URL
// Use VITE_API_URL from environment variables if available, otherwise use relative paths
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.error(`API Error (${res.status}):`, { 
      url: res.url,
      status: res.status, 
      statusText: res.statusText,
      text
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string, // url should be the path, e.g., "/api/users"
  data?: unknown | undefined,
): Promise<Response> {
  // Prepend the base URL to the path
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log(`Making API request: ${method} ${fullUrl}`); // Log the full URL being requested
  
  const res = await fetch(fullUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const queryPath = queryKey[0] as string;
    // Prepend the base URL to the query path
    const fullQueryUrl = `${API_BASE_URL}${queryPath}`;
    console.log(`Making query request: ${fullQueryUrl}`); // Log the full URL being queried
    
    try {
      const res = await fetch(fullQueryUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      
      const data = await res.json();
      console.log(`Query success for ${fullQueryUrl}:`, data);
      return data;
    } catch (error) {
      console.error(`Query error for ${fullQueryUrl}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

