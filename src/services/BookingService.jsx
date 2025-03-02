import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Create the service object
export const bookingService = {
  createBooking: async (bookingDTO) => {
    const response = await apiClient.post("/bookings", bookingDTO);
    return response;
  },

  getAllBookings: async () => {
    const response = await apiClient.get("/bookings");
    return response;
  },

  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response;
  },

  updateBooking: async (id, bookingDTO) => {
    const response = await apiClient.put(`/bookings/${id}`, bookingDTO);
    return response;
  },

  confirmBooking: async (id, remainingAmount) => {
    const response = await apiClient.put(`/bookings/${id}/confirm`, null, {
      params: { remainingAmount },
    });
    return response;
  },

  cancelBooking: async (id, refundAmount) => {
    const response = await apiClient.post(`/bookings/${id}/cancel`, null, {
      params: { refundAmount },
    });
    return response;
  },
  deleteBooking: async (id) => {
    await apiClient.delete(`/bookings/${id}`);
    return id;
  },

  deleteAllBookings: async () => {
    await apiClient.delete("/bookings");
  },
};

export default bookingService;
