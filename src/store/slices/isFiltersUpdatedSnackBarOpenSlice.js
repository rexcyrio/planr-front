import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = false;

const isFiltersUpdatedSnackBarOpenSlice = createSlice({
  name: "isFiltersUpdatedSnackBarOpen",
  initialState,
  reducers: {
    _setIsFiltersUpdatedSnackBarOpen: (state, action) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

const { _setIsFiltersUpdatedSnackBarOpen } =
  isFiltersUpdatedSnackBarOpenSlice.actions;

export function setIsFiltersUpdatedSnackBarOpen(open) {
  return function thunk(dispatch, getState) {
    if (getState().filteringTasks.filterMode === "Show all") {
      // do not show snack bar
      return;
    }

    dispatch(_setIsFiltersUpdatedSnackBarOpen(open));
  };
}

export default isFiltersUpdatedSnackBarOpenSlice.reducer;
