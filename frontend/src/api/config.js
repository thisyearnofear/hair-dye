export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const NEYNAR_CLIENT_ID = process.env.REACT_APP_NEYNAR_CLIENT_ID;

// Add base API configuration for axios
import axios from "axios";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
