import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    _addModules: (state, action) => {
      state.push([...action.payload]);
      return state;
    },
  },
});

// private function
const { _addModules } = modulesSlice.actions;

export function addModules(newModuleItems) {
  return async function thunk(dispatch, getState) {
    dispatch(_addModules(newModuleItems));
    // TODO: update database
  };
}

export default modulesSlice.reducer;
