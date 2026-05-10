import axios from "axios";

/**
 * Central Axios instance for future RAG backend integration.
 * Reads base URL from VITE_API_URL; falls back to /api for same-origin proxy.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 120000,  // Increased to 120 seconds for LLM responses
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
    console.error('API Error:', err?.response?.data || err?.message || err);
    // Surface a clean error shape; future global toast can hook here.
    return Promise.reject(err?.response?.data ?? err);
  }
);

export const ChatAPI = {
  send: async (message: string, sessionId: string) => {
    const res = await api.post("/chat", { question: message, session_id: sessionId });
    return res.data;
  },
};

export const DocsAPI = {
  upload: async (files: File[], onProgress?: (p: number) => void) => {
    console.log('[DocsAPI] Starting upload:', {
      fileCount: files.length,
      files: files.map(f => ({ name: f.name, size: f.size, type: f.type })),
      apiBaseURL: api.defaults.baseURL
    });
    
    const formData = new FormData();
    files.forEach(f => {
      console.log('[DocsAPI] Appending file:', f.name);
      formData.append("files", f);
    });
    
    try {
      console.log('[DocsAPI] Sending POST request to /upload');
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const progress = Math.round((e.loaded * 100) / e.total);
            console.log('[DocsAPI] Upload progress:', progress + '%');
            onProgress?.(progress);
          }
        },
      });
      console.log('[DocsAPI] Upload successful:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('[DocsAPI] Upload failed:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        config: {
          url: error?.config?.url,
          baseURL: error?.config?.baseURL,
          method: error?.config?.method
        }
      });
      throw error;
    }
  },
};

export const AuthAPI = {
  login: async (email: string, _password: string) => ({ token: "demo", email }),
  signup: async (email: string, _password: string) => ({ token: "demo", email }),
};

export default api;
