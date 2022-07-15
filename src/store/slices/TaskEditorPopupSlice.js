import { createSlice } from "@reduxjs/toolkit";

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
});

export const { setTaskEditorPopupWarningOpen } = TaskEditorPopupSlice.actions;
export default TaskEditorPopupSlice.reducer;
