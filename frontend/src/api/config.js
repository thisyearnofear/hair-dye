export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";

export const NEYNAR_CLIENT_ID = process.env.REACT_APP_NEYNAR_CLIENT_ID;

export const apiClient = {
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`);
    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
