import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billService } from "../services/BillService";

export const generateBill = createAsyncThunk(
  "bill/generateBill",
  async (bookingId, { rejectWithValue }) => {
    try {
      const bill = await billService.generateBill(bookingId);
      return bill;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchBillByBookingId = createAsyncThunk(
  "bill/fetchBillByBookingId",
  async (bookingId, { rejectWithValue }) => {
    try {
      console.log("Fetching bill for booking ID:", bookingId);
      const bill = await billService.getBillByBookingId(bookingId);
      console.log("Bill fetched successfully:", bill);
      return bill;
    } catch (error) {
      console.error("Error fetching bill:", error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  bill: null,
  loading: false,
  success: false,
  error: null,
};

// Slice
const billSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    resetBillState: (state) => {
      state.bill = null;
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(generateBill.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(generateBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bill = action.payload;
        state.success = true;
      })

      .addCase(generateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to generate bill";
        state.success = false;
      })

      .addCase(fetchBillByBookingId.pending, (state) => {
        console.log("Fetching bill...");
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBillByBookingId.fulfilled, (state, action) => {
        console.log("Bill fetched successfully:", action.payload);
        state.loading = false;
        state.bill = action.payload;
      })

      .addCase(fetchBillByBookingId.rejected, (state, action) => {
        console.log("Failed to fetch bill:", action.payload);
        state.error = action.payload || "Failed to fetch bill";
      });
  },
});

export const { resetBillState } = billSlice.actions;

export default billSlice.reducer;
