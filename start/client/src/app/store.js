import { configureStore } from "@reduxjs/toolkit";
import { teamReducer } from "../features/team/teamSlice.js";
import { playerReducer } from "../features/player/playerSlice.js";
import { geminiReducer } from "../features/gemini/geminiSlice.js";
import membershipReducer from "../features/membership/membershipSlice.js";

export default configureStore({
  reducer: {
    membership: membershipReducer,
    team: teamReducer,
    player: playerReducer,
    gemini: geminiReducer,
  },
});
