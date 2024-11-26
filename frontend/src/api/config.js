export const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : "http://localhost:8001";

export const NEYNAR_CLIENT_ID = process.env.REACT_APP_NEYNAR_CLIENT_ID;
