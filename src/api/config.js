// Global API base URLs
const API_BASE_URL = import.meta.env.VITE_BASE_URL || `http://localhost:3001/v1`;

// Auth API (defaults to http://localhost:4000)
const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:4000';

export { API_BASE_URL, AUTH_BASE_URL };
