import axios from "axios";

const userManagementLink = import.meta.env.VITE_USER_MANAGEMENT
console.log("User Management URL:", userManagementLink);

// Base configuration for axios
const api = axios.create({
  baseURL: `${userManagementLink}/api`, 
  headers: {
    "Content-Type": "application/json",
    },
});

// Retrieve the token from localStorage
const getToken = () => {
  return sessionStorage.getItem("token");
};

// GET request utility
export const getRequest = async (url) => {
  try {
    const token = getToken();
    const response = await api.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error; 
  }
};

// POST request utility
export const postRequest = async (url, data) => {
  try {
    const token = getToken();
    const response = await api.post(url, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// PUT request utility
export const putRequest = async (url, data) => {
  try {
    const token = getToken();
    const response = await api.put(url, data, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// DELETE request utility
export const deleteRequest = async (url) => {
  try {
    const token = getToken();
    const response = await api.delete(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Centralized error handler
const handleApiError = (error) => {
  if (error.response) {
    // HTTP response errors
    if (error.response.status === 401) {
      console.error("Unauthorized: Please log in again");
    } else if (error.response.status === 403) {
      console.error("Forbidden: You do not have permission to access this resource");
    } else {
      console.error(`Error ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
    }
  } else if (error.request) {
    // Network errors
    console.error("Network error: Please check your internet connection");
  } else {
    // Other errors
    console.error("Error:", error.message);
  }
};

export default api;
