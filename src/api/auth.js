import axios from "axios";
import { API_BASE_URL } from "./config";

const ROOT_BASE_URL = API_BASE_URL.replace(/\/v1\/?$/, "");

export const login = (email, password) => {
  const payload = { email, password };
  return axios.post(`${ROOT_BASE_URL}/api/auth/login`, payload);
};
