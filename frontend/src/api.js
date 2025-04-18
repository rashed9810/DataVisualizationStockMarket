import axios from "axios";

// Determine the API base URL based on environment
const getBaseUrl = () => {
  // For production, use the environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // For local development
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5000";
  }

  // Default fallback (you can replace this with your deployed backend URL)
  return "https://stock-market-api.vercel.app";
};

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Customize the error message for network errors
    if (error.message === "Network Error") {
      error.message =
        "Network Error: Cannot connect to the server. Please check if the backend server is running.";
    }
    return Promise.reject(error);
  }
);

export default api;
