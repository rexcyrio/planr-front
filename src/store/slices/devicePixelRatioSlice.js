import { createSlice } from "@reduxjs/toolkit";

const initialState = 1;

const devicePixelRatioSlice = createSlice({
  name: "devicePixelRatio",
  initialState,
  reducers: {
    setDevicePixelRatio: (state, action) => action.payload,
  },
});

export const { setDevicePixelRatio } = devicePixelRatioSlice.actions;
export default devicePixelRatioSlice.reducer;
