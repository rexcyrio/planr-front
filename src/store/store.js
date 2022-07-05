import { configureStore } from "@reduxjs/toolkit";
import matrixReducer from "./slices/matrixSlice";
import modulesReducer from "./slices/modulesSlice";
import NUSModsURLReducer from "./slices/NUSModsURLSlice";
import tasksReducer from "./slices/tasksSlice";
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import linksReducer from "./slices/linksSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    links: linksReducer,
    tasks: tasksReducer,
    theme: themeReducer,
    matrix: matrixReducer,
    modules: modulesReducer,
    NUSModsURL: NUSModsURLReducer,
    // TODO: settings reducer
  },
});
