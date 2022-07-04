import { createSlice } from "@reduxjs/toolkit";

export const dataStatusSlice = createSlice({
  name: "dataStatus",
  initialState: {
    links: "INITIAL_LOAD",
    notes: "INITIAL_LOAD",
    tasks: "INITIAL_LOAD",
  },
  reducers: {
    updateDataStatus: (state, action) => {
      const newKeyValuePairs = action.payload;
      const newState = {};

      for (const [key, value] of Object.entries(state)) {
        if (key in newKeyValuePairs) {
          newState[key] = newKeyValuePairs[key];
        } else {
          newState[key] = value;
        }
      }

      return newState;
    },
  },
});

export const { updateDataStatus } = dataStatusSlice.actions;
export default dataStatusSlice.reducer;
