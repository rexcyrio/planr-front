import { configureStore } from "@reduxjs/toolkit";
import matrixReducer from "./slices/matrixSlice";
import modulesReducer from "./slices/modulesSlice";
import NUSModsURLReducer from "./slices/NUSModsURLSlice";
import tasksReducer from "./slices/tasksSlice";
import themeNameReducer from "./slices/themeNameSlice";
import mappingModuleCodeToColourNameReducer from "./slices/mappingModuleCodeToColourNameSlice";
import userReducer from "./slices/userSlice";
import linksReducer from "./slices/linksSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    links: linksReducer,
    tasks: tasksReducer,
    matrix: matrixReducer,
    modules: modulesReducer,

    // settings
    NUSModsURL: NUSModsURLReducer,
    themeName: themeNameReducer,
    mappingModuleCodeToColourName: mappingModuleCodeToColourNameReducer,
  },
});
