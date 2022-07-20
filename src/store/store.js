import { configureStore } from "@reduxjs/toolkit";
import filteringTasksReducer from "./slices/filteringTasksSlice";
import isInitialSnackBarOpenReducer from "./slices/isInitialSnackBarOpenSlice";
import isNewUserReducer from "./slices/isNewUserSlice";
import linksReducer from "./slices/linksSlice";
import mappingModuleCodeToColourNameReducer from "./slices/mappingModuleCodeToColourNameSlice";
import matrixReducer from "./slices/matrixSlice";
import modulesReducer from "./slices/modulesSlice";
import notesReducer from "./slices/notesSlice";
import NUSModsURLReducer from "./slices/NUSModsURLSlice";
import sortingTasksReducer from "./slices/sortingTasksSlice";
import TaskEditorPopupReducer from "./slices/TaskEditorPopupSlice";
import tasksReducer from "./slices/tasksSlice";
import themeNameReducer from "./slices/themeNameSlice";
import timeReducer from "./slices/timeSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    links: linksReducer,
    tasks: tasksReducer,
    matrix: matrixReducer,
    modules: modulesReducer,
    time: timeReducer,
    notes: notesReducer,

    // settings
    NUSModsURL: NUSModsURLReducer,
    themeName: themeNameReducer,
    mappingModuleCodeToColourName: mappingModuleCodeToColourNameReducer,

    // extras
    isNewUser: isNewUserReducer,
    isInitialSnackBarOpen: isInitialSnackBarOpenReducer,

    // popup manager
    TaskEditorPopup: TaskEditorPopupReducer,

    // filtering + sorting tasks
    filteringTasks: filteringTasksReducer,
    sortingTasks: sortingTasksReducer,
  },
});
