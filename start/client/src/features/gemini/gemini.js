import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const geminiSlice = createSlice({
  name: "gemini",
  initialState: {
    data: [],
    loading: false,
    error: {},
  },
  reducers: {
    fetchPending: (state) => {
      state.loading = true;
    },
    fetchSuccess: (state, action) => {
      state.geminis = action.payload;
      state.loading = false;
    },
    fetchFailed: (state, action) => {
      state.error = action.payload;
      state.loading = true;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = geminiSlice.actions;

export const fetchAI = (input) => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await axios.get(`http://localhost:3002/`);

    dispatch(fetchSuccess(result));
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const geminiReducer = geminiSlice.reducer;
