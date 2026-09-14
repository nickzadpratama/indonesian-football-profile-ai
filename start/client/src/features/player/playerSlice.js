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

export const fetchPlayers = () => async (dispatch) => {
  try {
    dispatch(fetchPending());

    // const result = await fetch(
    //   `https://v3.football.api-sports.io/players/squads?player=${playerId}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
    //     },
    //   },
    // );

    const result = await fetch(`https://v1.basketball.api-sports.io/players`, {
      method: "GET",
      headers: {
        "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
      },
    });

    const data = await result.json();
    dispatch(fetchSuccess(data.response));
    console.log(data.response);
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const playerReducer = playerSlice.reducer;
