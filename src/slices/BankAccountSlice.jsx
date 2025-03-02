import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getBankAccounts,
  addBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountTransactions,
  getAllTransactions,
  deleteTransaction,
} from "../services/BankAccountService";

export const fetchBankAccounts = createAsyncThunk(
  "bankAccounts/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getBankAccounts();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBankAccount = createAsyncThunk(
  "bankAccounts/create",
  async (bankAccount, { rejectWithValue }) => {
    try {
      return await addBankAccount(bankAccount);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editBankAccount = createAsyncThunk(
  "bankAccounts/update",
  async ({ id, bankAccount }, { rejectWithValue }) => {
    try {
      return await updateBankAccount(id, bankAccount);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeBankAccount = createAsyncThunk(
  "bankAccounts/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteBankAccount(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBankAccountTransactions = createAsyncThunk(
  "bankAccounts/fetchTransactions",
  async (bankAccountId, { rejectWithValue }) => {
    try {
      const response = await getBankAccountTransactions(bankAccountId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch all transactions across all bank accounts
export const fetchAllTransactions = createAsyncThunk(
  "bankAccounts/fetchAllTransactions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllTransactions();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete a specific transaction
export const removeTransaction = createAsyncThunk(
  "bankAccounts/deleteTransaction",
  async (transactionId, { rejectWithValue }) => {
    try {
      await deleteTransaction(transactionId);
      return transactionId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const bankAccountSlice = createSlice({
  name: "bankAccounts",
  initialState: {
    accounts: [],
    transactions: [], // Transactions for a specific bank account
    allTransactions: [], // All transactions across all bank accounts
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch bank accounts
      .addCase(fetchBankAccounts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBankAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchBankAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Create bank account
      .addCase(createBankAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })
      .addCase(createBankAccount.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Edit bank account
      .addCase(editBankAccount.fulfilled, (state, action) => {
        const index = state.accounts.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(editBankAccount.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove bank account
      .addCase(removeBankAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      })
      .addCase(removeBankAccount.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch transactions for a specific bank account
      .addCase(fetchBankAccountTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBankAccountTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchBankAccountTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Fetch all transactions across all bank accounts
      .addCase(fetchAllTransactions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.allTransactions = action.payload;
        state.error = null;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete a specific transaction
      .addCase(removeTransaction.fulfilled, (state, action) => {
        state.allTransactions = state.allTransactions.filter(
          (t) => t.id !== action.payload
        );
      })
      .addCase(removeTransaction.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export default bankAccountSlice.reducer;
