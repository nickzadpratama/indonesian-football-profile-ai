import { createSlice } from "@reduxjs/toolkit";

export const teamSlice = createSlice({
  name: "team",
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

export const { fetchPending, fetchSuccess, fetchFailed } = teamSlice.actions;

export const fetchTeams = () => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await fetch(
      `https://v3.football.api-sports.io/teams?country=indonesia`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": "e97b54e0e16c4e3d0a06167836b1f5a2", // <-- Ganti dengan API key Anda
        },
      },
    );
    const data = await result.json();
    console.log(data);
    dispatch(fetchSuccess(data.response));
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const fetchTeam = (teamId) => async (dispatch) => {
  try {
    dispatch(fetchPending());
    const result = await fetch(
      `https://v3.football.api-sports.io/teams?id=${teamId}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": "e97b54e0e16c4e3d0a06167836b1f5a2", // <-- Ganti dengan API key Anda
        },
      },
    );

    console.log(data.response);
    const data = await result.json();
    dispatch(fetchSuccess(data.response));
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const teamReducer = teamSlice.reducer;
