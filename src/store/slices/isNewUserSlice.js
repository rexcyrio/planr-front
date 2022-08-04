import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = false;

const isNewUserSlice = createSlice({
  name: "isNewUser",
  initialState,
  reducers: {
    setIsNewUser: (state, action) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { setIsNewUser } = isNewUserSlice.actions;
export default isNewUserSlice.reducer;
