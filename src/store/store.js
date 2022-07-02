import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./slices/tasksSlice";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import matrixReducer from "./slices/matrixSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: tasksReducer,
    theme: themeReducer,
    matrix: matrixReducer,
  },
});
