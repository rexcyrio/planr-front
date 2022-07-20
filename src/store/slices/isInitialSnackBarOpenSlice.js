import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const isInitialSnackBarOpenSlice = createSlice({
  name: "isInitialSnackBarOpen",
  initialState,
  reducers: {
    setIsInitialSnackBarOpen: (state, action) => action.payload,
  },
});

export const { setIsInitialSnackBarOpen } = isInitialSnackBarOpenSlice.actions;
export default isInitialSnackBarOpenSlice.reducer;
