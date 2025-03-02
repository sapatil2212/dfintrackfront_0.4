import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/bills`;

const generateBill = async (bookingId) => {
  try {
    // Add validation
    if (!bookingId || bookingId === "undefined") {
      throw new Error("Invalid booking ID: cannot be undefined");
    }

    console.log("Calling API to generate bill for booking ID:", bookingId);
    const response = await axios.post(`${API_BASE_URL}/generate/${bookingId}`);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error generating bill:", error);
    throw error;
  }
};

const getBillByBookingId = async (bookingId) => {
  try {
    console.log("Calling API to fetch bill for booking ID:", bookingId);
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}`);
    console.log("API response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching bill:", error);
    throw error;
  }
};

const checkBillExists = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/exists/${bookingId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false };
    }
    console.error("Error checking if bill exists:", error);
    throw error;
  }
};

export const billService = {
  generateBill,
  getBillByBookingId,
  checkBillExists,
};
