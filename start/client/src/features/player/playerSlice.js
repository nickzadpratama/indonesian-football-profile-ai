import { createSlice } from "@reduxjs/toolkit";
import { getPlayerStatistics } from "../../api/football.js";

export const playerSlice = createSlice({
  name: "player",
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
      state.loading = false;
    },
    fetchFailed: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = playerSlice.actions;

export const fetchPlayerStatistic = (playerId, season) => async (dispatch) => {
  dispatch(fetchPending());
  try {
    dispatch(fetchSuccess(await getPlayerStatistics(playerId, season)));
  } catch (error) {
    dispatch(fetchFailed(error.message || String(error)));
  }
};

export const playerReducer = playerSlice.reducer;
