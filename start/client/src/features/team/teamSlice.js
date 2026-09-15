// import { createSlice } from "@reduxjs/toolkit";

// export const teamSlice = createSlice({
//   name: "team",
//   initialState: {
//     data: [],
//     loading: false,
//     error: {},
//   },
//   reducers: {
//     fetchPending: (state) => {
//       state.loading = true;
//     },
//     fetchSuccess: (state, action) => {
//       state.data = action.payload;
//       state.loading = false;
//     },
//     fetchFailed: (state, action) => {
//       state.error = action.payload;
//       state.loading = true;
//     },
//   },
// });

// export const { fetchPending, fetchSuccess, fetchFailed } = teamSlice.actions;

// export const fetchTeams = () => async (dispatch) => {
//   try {
//     dispatch(fetchPending());

//     const result = await fetch(
//       `https://v3.football.api-sports.io/teams?country=Indonesia`,
//       {
//         method: "GET",
//         headers: {
//           "x-apisports-key": "e194d63f6878ad3c12abc5d1a31cb315", // <-- Ganti dengan API key Anda
//         },
//       },
//     );
//     const data = await result.json();
//     dispatch(fetchSuccess(data.response));
//   } catch (error) {
//     dispatch(fetchFailed(error.message || error));
//   }
// };

// export const fetchTeamPlayer = () => async (dispatch) => {
//   try {
//     console.log("object");
//     dispatch(fetchPending());
//     const result = await fetch(
//       `https://v3.football.api-sports.io/teams?id=1571`,
//       // `https://v3.football.api-sports.io/teams?id=${teamId}`,
//       {
//         method: "GET",
//         headers: {
//           "x-apisports-key": "e194d63f6878ad3c12abc5d1a31cb315", // <-- Ganti dengan API key Anda
//         },
//       },
//     );

//     const data = await result.json();
//     dispatch(fetchSuccess(data.response));
//   } catch (error) {
//     console.log(error);
//     dispatch(fetchFailed(error.message || error));
//   }
// };

// export const teamReducer = teamSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

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

// Action creators are generated for each case reducer function
export const { fetchPending, fetchSuccess, fetchFailed } = teamSlice.actions;

export const fetchTeams = () => async (dispatch) => {
  try {
    dispatch(fetchPending());

    const result = await fetch(
      `https://v3.football.api-sports.io/teams?country=Indonesia`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": "e194d63f6878ad3c12abc5d1a31cb315", // <-- Ganti dengan API key Anda
        },
      },
    );
    const data = await result.json();
    dispatch(fetchSuccess(data.response));
  } catch (error) {
    dispatch(fetchFailed(error.message || error));
  }
};

export const fetchTeamPlayer = () => async (dispatch) => {
  try {
    console.log("object");
    dispatch(fetchPending());
    const result = await fetch(
      `https://v3.football.api-sports.io/players/squads?team=1571`,
      // `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": "e194d63f6878ad3c12abc5d1a31cb315", // <-- Ganti dengan API key Anda
        },
      },
    );

    const data = await result.json();
    dispatch(fetchSuccess(data.response));
  } catch (error) {
    console.log(error);
    dispatch(fetchFailed(error.message || error));
  }
};

export const teamReducer = teamSlice.reducer;
