import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/properties`;

const getAllProperties = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const getPropertyById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

const createProperty = async (propertyData) => {
  const response = await axios.post(API_URL, propertyData);
  return response.data;
};

const updateProperty = async (id, propertyData) => {
  const response = await axios.put(`${API_URL}/${id}`, propertyData);
  return response.data;
};

const deleteProperty = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const propertyService = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
};
