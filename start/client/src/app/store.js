import { configureStore } from "@reduxjs/toolkit";
import { teamReducer } from "../features/team/teamSlice.js";
import { playerReducer } from "../features/player/playerSlice.js";
import { geminiReducer } from "../features/gemini/geminiSlice.js";

export default configureStore({
  reducer: {
    team: teamReducer,
    player: playerReducer,
    gemini: geminiReducer,
  },
});
