import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";

const initialState = "Eighties";

const themeNameSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    _setThemeName: (state, action) => action.payload,
  },
});

export const { _setThemeName } = themeNameSlice.actions;

export function setThemeName(themeName) {
  return function thunk(dispatch, getState) {
    dispatch(_setThemeName(themeName));
    dispatch(setThemeNameInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const setThemeNameInDatabase = createAsyncThunk(
  "matrix/setThemeNameInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const themeName = getState().themeName;

    try {
      const res = await fetch("/api/private/themeName", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, themeName }),
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

export default themeNameSlice.reducer;
