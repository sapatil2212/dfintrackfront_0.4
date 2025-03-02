import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { propertyService } from "../services/PropertyService";

export const fetchProperties = createAsyncThunk(
  "properties/fetchProperties",
  async () => {
    const response = await propertyService.getAllProperties();
    return response;
  }
);

export const addProperty = createAsyncThunk(
  "properties/addProperty",
  async (propertyData) => {
    const response = await propertyService.createProperty(propertyData);
    return response;
  }
);

export const updateProperty = createAsyncThunk(
  "properties/updateProperty",
  async ({ id, propertyData }) => {
    const response = await propertyService.updateProperty(id, propertyData);
    return response;
  }
);

export const deleteProperty = createAsyncThunk(
  "properties/deleteProperty",
  async (id) => {
    await propertyService.deleteProperty(id);
    return id;
  }
);

const initialState = {
  properties: [],
  status: "idle",
  error: null,
};

const propertySlice = createSlice({
  name: "properties",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.properties = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || null;
      })
      .addCase(addProperty.fulfilled, (state, action) => {
        state.properties.push(action.payload);
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        const index = state.properties.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.properties[index] = action.payload;
        }
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.properties = state.properties.filter(
          (p) => p.id !== action.payload
        );
      });
  },
});

export default propertySlice.reducer;
