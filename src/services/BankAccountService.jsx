import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/bank-accounts`;

export const getBankAccounts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addBankAccount = async (bankAccount) => {
  const response = await axios.post(`${API_URL}/add`, bankAccount);
  return response.data;
};

export const updateBankAccount = async (id, bankAccount) => {
  const response = await axios.put(`${API_URL}/${id}`, bankAccount);
  return response.data;
};

export const deleteBankAccount = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
};

export const getBankAccountTransactions = async (bankAccountId) => {
  const response = await axios.get(`${API_URL}/passbook/${bankAccountId}`);
  return response.data;
};
export const getAllTransactions = async () => {
  const response = await axios.get(`${API_URL}/transactions`);
  return response.data;
};

// Delete a specific transaction
export const deleteTransaction = async (transactionId) => {
  await axios.delete(`${API_URL}/transactions/${transactionId}`);
  return transactionId;
};
