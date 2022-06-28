import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state = action.payload;
      return state;
    },
    addTask: (state, action) => {
      state.push(action.payload);
      return state;
    },
  },
});

export const { setTasks, addTask } = tasksSlice.actions;

export default tasksSlice.reducer;
