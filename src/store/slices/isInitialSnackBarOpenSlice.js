import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = false;

const isInitialSnackBarOpenSlice = createSlice({
  name: "isInitialSnackBarOpen",
  initialState,
  reducers: {
    setIsInitialSnackBarOpen: (state, action) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { setIsInitialSnackBarOpen } = isInitialSnackBarOpenSlice.actions;
export default isInitialSnackBarOpenSlice.reducer;
