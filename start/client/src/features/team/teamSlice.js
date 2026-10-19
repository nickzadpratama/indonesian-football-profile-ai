import { createSlice } from "@reduxjs/toolkit";
import { getSquad, getTeams } from "../../api/football.js";

const initialState = {
  data: [],
  loading: false,
  error: "",
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    fetchPending: (state) => {
      state.data = initialState.data;
      state.loading = true;
      state.error = initialState.error;
    },
    fetchSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = initialState.error;
    },
    fetchFailed: (state, action) => {
      state.data = initialState.data;
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = teamSlice.actions;

export const fetchTeams = () => async (dispatch) => {
  dispatch(fetchPending());
  try {
    dispatch(fetchSuccess(await getTeams("Indonesia")));
  } catch (error) {
    dispatch(fetchFailed(error.message || String(error)));
  }
};

export const fetchTeamPlayer = (teamId) => async (dispatch) => {
  dispatch(fetchPending());
  try {
    dispatch(fetchSuccess([await getSquad(teamId)]));
  } catch (error) {
    dispatch(fetchFailed(error.message || String(error)));
  }
};

export const teamReducer = teamSlice.reducer;
