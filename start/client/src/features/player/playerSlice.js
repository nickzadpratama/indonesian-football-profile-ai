import { createSlice } from "@reduxjs/toolkit";

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
      state.loading = true;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = playerSlice.actions;

export const fetchPlayerStatistic = (playerId, season) => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await fetch(
      `https://v3.football.api-sports.io/players?id=${playerId}&season=${season}`,
      {
        method: "GET",
        headers: { "x-apisports-key": "e194d63f6878ad3c12abc5d1a31cb315" },
      },
    );

    const data = await result.json();
    dispatch(fetchSuccess(data.response));
    console.log(data.response);
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const playerReducer = playerSlice.reducer;
