const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8001";

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log("Backend health status:", data);
    return data.status === "healthy";
  } catch (error) {
    console.error("Health check failed:", error);
    return false;
  }
};
