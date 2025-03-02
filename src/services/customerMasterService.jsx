import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/customers`;

export const customerService = {
  getAllCustomers: async () => {
    const response = await axios.get(BASE_URL);
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await axios.post(BASE_URL, customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await axios.put(`${BASE_URL}/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    await axios.delete(`${BASE_URL}/${id}`);
    return id;
  },
};
