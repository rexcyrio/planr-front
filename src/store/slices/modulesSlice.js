import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";

const initialState = [];

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    _setModules: (state, action) => action.payload,
  },
});

export const { _setModules } = modulesSlice.actions;

export function setModules(newModuleItems) {
  return function thunk(dispatch, getState) {
    dispatch(_setModules(newModuleItems));
    dispatch(setModulesInDatabase(newModuleItems));
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const setModulesInDatabase = createAsyncThunk(
  "tasks/setModulesInDatabase",
  async (modules, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/modules", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, modules }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

export default modulesSlice.reducer;
