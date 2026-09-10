import { configureStore } from "@reduxjs/toolkit";
// import counterReducer from "../features/counter/counterSlice";

// export default configureStore({
//   reducer: {
//     // counter: counterReducer,
//     todo: todoReducer,
//   },
// });
import todoReducer from "../features/todo/todoSlice.js";

export const store = configureStore({
  reducer: {
    todo: todoReducer,
  },
});

export default store;
