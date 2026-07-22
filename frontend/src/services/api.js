import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const auth = localStorage.getItem("mail-automation-auth");

  if (auth) {
    try {
      const parsed = JSON.parse(auth);

      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // Ignore malformed storage values.
    }
  }

  return config;
});

export default api;