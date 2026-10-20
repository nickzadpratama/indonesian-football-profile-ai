import { createSlice } from "@reduxjs/toolkit";
import { getSquad, getTeams } from "../../api/football.js";

const initialState = {
  data: [],
  loading: false,
  error: "",
  squads: {},
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
    fetchSquadPending: (state, action) => {
      const teamId = String(action.payload);
      state.squads[teamId] = {
        data: [],
        loading: true,
        error: "",
      };
    },
    fetchSquadSuccess: (state, action) => {
      const teamId = String(action.payload.teamId);
      state.squads[teamId] = {
        data: [action.payload.squad],
        loading: false,
        error: "",
      };
    },
    fetchSquadFailed: (state, action) => {
      const teamId = String(action.payload.teamId);
      state.squads[teamId] = {
        data: [],
        loading: false,
        error: action.payload.error,
      };
    },
  },
});

export const {
  fetchPending,
  fetchSuccess,
  fetchFailed,
  fetchSquadPending,
  fetchSquadSuccess,
  fetchSquadFailed,
} = teamSlice.actions;

export const fetchTeams = () => async (dispatch) => {
  dispatch(fetchPending());
  try {
    dispatch(fetchSuccess(await getTeams("Indonesia")));
  } catch (error) {
    dispatch(fetchFailed(error.message || String(error)));
  }
};

export const fetchTeamPlayer = (teamId, { force = false } = {}) =>
  async (dispatch, getState) => {
    const key = String(teamId);
    const current = getState().team.squads[key];
    if (current?.loading || (current?.data.length > 0 && !force)) return;

    dispatch(fetchSquadPending(teamId));
    try {
      dispatch(fetchSquadSuccess({ teamId, squad: await getSquad(teamId) }));
    } catch (error) {
      dispatch(
        fetchSquadFailed({
          teamId,
          error: error.message || String(error),
        }),
      );
    }
  };

export const teamReducer = teamSlice.reducer;
