import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./authSlice.js";
import todoReducer from "../features/todo/todoSlice.js";

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
});

export default store;
