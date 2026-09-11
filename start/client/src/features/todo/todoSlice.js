import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const todoSlice = createSlice({
  name: "todo",
  initialState: {
    todos: [],
    loading: false,
    error: {},
  },
  reducers: {
    fetchPending: (state) => {
      state.loading = true;
    },
    fetchSuccess: (state, action) => {
      state.todos = action.payload;
      state.loading = false;
    },
    fetchFailed: (state, action) => {
      state.error = action.payload;
      state.loading = true;
    },
  },
});

export const { fetchPending, fetchSuccess, fetchFailed } = todoSlice.actions;

export const fetchTeams = () => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await fetch(
      `https://v3.football.api-sports.io/teams?country=indonesia`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
        },
      },
    );
    const data = await result.json();
    dispatch(fetchSuccess(data.response));
    console.log(data.response);
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
          "x-apisports-key": "51a6f63d7c6835b341a49be3985f148c", // <-- Ganti dengan API key Anda
        },
      },
    );

    const data = await result.json();
    dispatch(fetchSuccess(data.response));
    console.log(data.response);
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const fetchPlayers = () => async (dispatch) => {
  try {
    dispatch(fetchPending());

    // const result = await fetch(
    //   `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
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

export const fetchAI = (input) => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await axios.get(`http://localhost:3002/`);

    dispatch(fetchSuccess(result));
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export default todoSlice.reducer;
