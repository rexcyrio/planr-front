import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = false;

const isFiltersUpdatedSnackBarOpenSlice = createSlice({
  name: "isFiltersUpdatedSnackBarOpen",
  initialState,
  reducers: {
    setIsFiltersUpdatedSnackBarOpen: (state, action) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { setIsFiltersUpdatedSnackBarOpen } =
  isFiltersUpdatedSnackBarOpenSlice.actions;

export default isFiltersUpdatedSnackBarOpenSlice.reducer;
