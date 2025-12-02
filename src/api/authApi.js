import axios from 'axios';
import { getApiUrl } from './config';
import { ENDPOINTS } from './config';

const authApi = axios.create({
  baseURL: getApiUrl('', true), // Use auth base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} User data and token
 */
export const login = async (credentials) => {
  try {
    const response = await authApi.post(ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // Add any logout logic here (e.g., clear tokens)
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

export default authApi;
