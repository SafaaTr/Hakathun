import axios from "axios";

// Dynamically determine backend base URL.
// When accessing from mobile / external devices via LAN IP (e.g. 192.168.x.x:3000),
// api calls will automatically target the same host on port 3001 instead of failing on localhost:3001.
const getBaseURL = () => {
  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `${window.location.protocol}//${window.location.hostname}:3001/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Dynamically sync base URL and attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = getBaseURL();
    const token = localStorage.getItem("token");
    if (token) {
      const cleanToken = token.trim();
      config.headers.Authorization = cleanToken.toLowerCase().startsWith("bearer ")
        ? cleanToken
        : `Bearer ${cleanToken}`;
    }
  }
  return config;
});

// Handle standard response wrapper
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error formatting
    return Promise.reject(error);
  }
);
