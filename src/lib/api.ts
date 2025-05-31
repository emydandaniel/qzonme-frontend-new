// Get the API URL from environment variable, fallback to relative path if not set
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to get the full API URL
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

// Helper function to make API requests
export async function apiRequest(
  method: string,
  path: string,
  data?: unknown
): Promise<Response> {
  try {
    const url = getApiUrl(path);
    console.log(`Making ${method} request to:`, url);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`API request failed (${response.status}):`, text);
      throw new Error(`${response.status}: ${text}`);
    }

    console.log(`${method} request to ${path} successful`);
    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}