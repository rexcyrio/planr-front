import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loggedInUsername: null,
  userId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setLoggedInUsername: (state, action) => {
      state.loggedInUsername = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const { setIsAuthenticated, setLoggedInUsername, setUserId } =
  userSlice.actions;

export default userSlice.reducer;
