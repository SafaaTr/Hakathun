import axios from "axios";

// Default base URL points to the backend /api/v1 contract
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
