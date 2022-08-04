import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = {
  warningOpen: false,
};

const TaskEditorPopupSlice = createSlice({
  name: "TaskEditorPopup",
  initialState,
  reducers: {
    setTaskEditorPopupWarningOpen: (state, action) => {
      state.warningOpen = action.payload;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { setTaskEditorPopupWarningOpen } = TaskEditorPopupSlice.actions;
export default TaskEditorPopupSlice.reducer;
