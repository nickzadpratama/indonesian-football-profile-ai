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
      state.data = action.payload;
      state.error = {};
      state.loading = false;
    },
    fetchFailed: (state, action) => {
      state.error = action.payload;
      state.data = [];
      state.loading = false;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = geminiSlice.actions;

export const fetchAI = (input) => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await axios.get(`http://football.nickz.online/genAI`, {
      params: { input },
    });

    dispatch(fetchSuccess(result.data));

    return result.data;
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const geminiReducer = geminiSlice.reducer;
