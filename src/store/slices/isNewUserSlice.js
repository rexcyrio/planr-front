import { createSlice } from "@reduxjs/toolkit";

const initialState = false;

const isNewUserSlice = createSlice({
  name: "isNewUser",
  initialState,
  reducers: {
    setIsNewUser: (state, action) => action.payload,
  },
});

export const { setIsNewUser } = isNewUserSlice.actions;
export default isNewUserSlice.reducer;
