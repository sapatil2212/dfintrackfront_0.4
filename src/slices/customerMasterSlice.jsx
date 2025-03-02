import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { customerService } from "../services/customerMasterService";

const initialState = {
  customers: [],
  selectedCustomer: null,
  status: "idle",
  error: null,
};

export const fetchCustomers = createAsyncThunk(
  "customers/fetchAll",
  async () => {
    return await customerService.getAllCustomers();
  }
);

export const createCustomer = createAsyncThunk(
  "customers/create",
  async (customerData) => {
    return await customerService.createCustomer(customerData);
  }
);

export const updateCustomer = createAsyncThunk(
  "customers/update",
  async ({ id, customerData }) => {
    return await customerService.updateCustomer(id, customerData);
  }
);

export const deleteCustomer = createAsyncThunk(
  "customers/delete",
  async (id) => {
    await customerService.deleteCustomer(id);
    return id;
  }
);

const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.customers = action.payload;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.push(action.payload);
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.customers.findIndex(
          (customer) => customer.id === action.payload.id
        );
        if (index !== -1) {
          state.customers[index] = action.payload;
        }
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter(
          (customer) => customer.id !== action.payload
        );
      });
  },
});

export const { setSelectedCustomer, clearSelectedCustomer } =
  customerSlice.actions;
export default customerSlice.reducer;
