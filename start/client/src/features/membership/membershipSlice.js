import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { membershipRequest } from "../../api/memberships.js";
import { clearToken, getToken, isTokenValid } from "../../auth/session.js";

const initialState = {
  session: "", items: {}, phase: "idle", error: "", pending: {}, errors: {},
  listRequest: null, revision: 0,
};

async function request(token, method, teamId, rejectWithValue) {
  try {
    return await membershipRequest(token, method, teamId);
  } catch (error) {
    if (error.response?.status === 401 && getToken() === token) clearToken();
    return rejectWithValue(error.response?.data?.message ?? error.message ?? "Unable to update membership");
  }
}

export const fetchMemberships = createAsyncThunk(
  "membership/fetch",
  (token, { rejectWithValue }) => request(token, "get", null, rejectWithValue),
  { condition: (token, { getState }) => {
    const state = getState().membership;
    return state.session === token && isTokenValid(token) && state.phase !== "loading"
      && Object.keys(state.pending).length === 0;
  } },
);

export const changeMembership = createAsyncThunk(
  "membership/change",
  ({ token, teamId, leave }, { rejectWithValue }) => request(token, leave ? "delete" : "put", teamId, rejectWithValue),
  { condition: ({ token, teamId, leave }, { getState }) => {
    const state = getState().membership;
    return state.session === token && isTokenValid(token) && state.phase === "ok"
      && !state.pending[teamId] && Boolean(state.items[teamId]) === Boolean(leave);
  } },
);

const slice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    membershipUpdated: (state, { payload }) => {
      if (state.session !== payload.token) return;
      state.items[payload.membership.FanClub.externalTeamId] = payload.membership;
      state.revision++;
    },
    setMembershipSession: (state, { payload }) => {
      if (state.session !== payload) return { ...initialState, session: payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberships.pending, (state, action) => {
        state.phase = "loading";
        state.error = "";
        state.listRequest = { id: action.meta.requestId, revision: state.revision };
      })
      .addCase(fetchMemberships.fulfilled, (state, action) => {
        if (state.session !== action.meta.arg || state.listRequest?.id !== action.meta.requestId) return;
        if (state.listRequest.revision === state.revision) {
          state.items = Object.fromEntries(action.payload.map((item) => [item.FanClub.externalTeamId, item]));
        }
        state.phase = "ok";
        state.listRequest = null;
      })
      .addCase(fetchMemberships.rejected, (state, action) => {
        if (state.session !== action.meta.arg || state.listRequest?.id !== action.meta.requestId) return;
        state.phase = "error";
        state.error = action.payload ?? "Unable to load fan clubs";
        state.listRequest = null;
      })
      .addCase(changeMembership.pending, (state, action) => {
        const { teamId } = action.meta.arg;
        state.pending[teamId] = action.meta.requestId;
        delete state.errors[teamId];
        state.revision++;
      })
      .addCase(changeMembership.fulfilled, (state, action) => {
        const { token, teamId, leave } = action.meta.arg;
        if (state.session !== token || state.pending[teamId] !== action.meta.requestId) return;
        if (leave) delete state.items[teamId];
        else state.items[teamId] = action.payload;
        delete state.pending[teamId];
        state.revision++;
      })
      .addCase(changeMembership.rejected, (state, action) => {
        const { token, teamId } = action.meta.arg;
        if (state.session !== token || state.pending[teamId] !== action.meta.requestId) return;
        delete state.pending[teamId];
        state.errors[teamId] = action.payload ?? "Unable to update fan club. Please retry.";
        state.revision++;
      });
  },
});

export const { setMembershipSession, membershipUpdated } = slice.actions;
export default slice.reducer;
