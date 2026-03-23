import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchInventory = createAsyncThunk(
  'inventory/fetchInventory',
  async (storeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/inventory/store/${storeId}`);
      // The backend seems to return { success: true, data: [...] } or just the array depending on the controller
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to fetch inventory');
    }
  }
);

export const addProduct = createAsyncThunk(
  'inventory/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/inventory', productData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'inventory/updateProduct',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/inventory/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'inventory/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/inventory/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message || 'Failed to delete product');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;
