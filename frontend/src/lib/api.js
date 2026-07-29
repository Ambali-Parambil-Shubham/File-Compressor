
export function getApiUrl(path) {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // Explicit env override
  if (import.meta.env.VITE_API_URL) {
    const base = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
    return `${base}${path}`;
  }

  // Unified server: frontend and API are served together — use relative path everywhere
  return path;
}
