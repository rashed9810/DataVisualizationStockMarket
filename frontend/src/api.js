import axios from "axios";

// Create an axios instance with a base URL
const api = axios.create({
  baseURL: "http://localhost:5000",
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
