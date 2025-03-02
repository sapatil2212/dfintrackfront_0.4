import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bookings: [],
  loading: false,
  error: null,
  currentBooking: null,
};

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    setBookings: (state, action) => {
      state.bookings = action.payload;
      state.error = null;
    },
    addBooking: (state, action) => {
      state.bookings.push(action.payload);
      state.error = null;
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(
        (booking) => booking.id === action.payload.id
      );
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      state.error = null;
    },
    deleteBooking: (state, action) => {
      state.bookings = state.bookings.filter(
        (booking) => booking.id !== action.payload
      );
      state.error = null;
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearBookings: (state) => {
      state.bookings = [];
      state.error = null;
    },
  },
});

export const {
  setBookings,
  addBooking,
  updateBooking,
  deleteBooking,
  setCurrentBooking,
  setLoading,
  setError,
  clearBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;
