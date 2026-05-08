import axios from "axios";

/**
 * Central Axios instance for future RAG backend integration.
 * Reads base URL from VITE_API_URL; falls back to /api for same-origin proxy.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("lexi_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Surface a clean error shape; future global toast can hook here.
    return Promise.reject(err?.response?.data ?? err);
  }
);

// ───────── Mock-first endpoint surface (swap with real RAG later) ─────────
export const ChatAPI = {
  send: async (message: string) => {
    // TODO: POST /chat { message }
    return { reply: `Mocked legal analysis for: "${message}"` };
  },
  history: async () => {
    // TODO: GET /chat/history
    return [];
  },
};

export const DocsAPI = {
  upload: async (_file: File, onProgress?: (p: number) => void) => {
    // TODO: POST /documents (multipart)
    for (let p = 0; p <= 100; p += 10) {
      await new Promise((r) => setTimeout(r, 80));
      onProgress?.(p);
    }
    return { id: crypto.randomUUID(), status: "indexed" as const };
  },
  list: async () => {
    // TODO: GET /documents
    return [];
  },
};

export const AuthAPI = {
  login: async (email: string, _password: string) => ({ token: "demo", email }),
  signup: async (email: string, _password: string) => ({ token: "demo", email }),
};

export default api;
