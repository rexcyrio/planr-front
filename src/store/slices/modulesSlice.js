import { createSlice } from "@reduxjs/toolkit";

const modulesSlice = createSlice({
  name: "modules",
  initialState: [],
  reducers: {
    _addModules: (state, action) => [...state, ...action.payload],
  },
});

// private function
const { _addModules } = modulesSlice.actions;

function addModules(newModuleItems) {
  return async function thunk(dispatch, getState) {
    dispatch(_addModules(newModuleItems));
    // TODO: update database
  };
}

export { modulesSlice, addModules };
export default modulesSlice.reducer;
