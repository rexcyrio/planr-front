import { configureStore } from "@reduxjs/toolkit";
import linksReducer from "./slices/linksSlice";
import mappingModuleCodeToColourNameReducer from "./slices/mappingModuleCodeToColourNameSlice";
import matrixReducer from "./slices/matrixSlice";
import modulesReducer from "./slices/modulesSlice";
import NUSModsURLReducer from "./slices/NUSModsURLSlice";
import tasksReducer from "./slices/tasksSlice";
import themeNameReducer from "./slices/themeNameSlice";
import timeReducer from "./slices/timeSlice";
import userReducer from "./slices/userSlice";
import isNewUserReducer from "./slices/isNewUserSlice";
import TaskEditorPopupReducer from "./slices/TaskEditorPopupSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    links: linksReducer,
    tasks: tasksReducer,
    matrix: matrixReducer,
    modules: modulesReducer,
    time: timeReducer,

    // settings
    NUSModsURL: NUSModsURLReducer,
    themeName: themeNameReducer,
    mappingModuleCodeToColourName: mappingModuleCodeToColourNameReducer,

    // extras
    isNewUser: isNewUserReducer,

    // popup manager
    TaskEditorPopup: TaskEditorPopupReducer,
  },
});
