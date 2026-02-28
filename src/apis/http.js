// src/apis/http.js
import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_BASE_URL || "https://ksmedial-enventory-backend.onrender.com/api";

export const BASE_URL = rawBaseURL.endsWith("/")
  ? rawBaseURL
  : `${rawBaseURL}/`;

const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach token for every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin-token"); // same key as AuthContext
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
