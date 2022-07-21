import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filterMode: "Show all",
  anyAll: "any",
  filterOptions: {
    "is scheduled": false,
    "is unscheduled": false,
    "is completed": false,
    "is incomplete": false,
    "is recurring": false,
    "is one-off": false,
  },
};

const filteringTasksSlice = createSlice({
  name: "filteringTasks",
  initialState,
  reducers: {
    _setFilterState: (state, action) => action.payload,
  },
});

const { _setFilterState } = filteringTasksSlice.actions;

export function setFilterState(filterState) {
  return function thunk(dispatch, getState) {
    dispatch(_setFilterState(filterState));
    window.localStorage.setItem("filterState", JSON.stringify(filterState));
  };
}

export function getFilterStateFromLocalStorage() {
  return function thunk(dispatch, getState) {
    const filterState = window.localStorage.getItem("filterState");

    if (filterState === null) {
      return;
    }

    dispatch(_setFilterState(JSON.parse(filterState)));
  };
}

export const filterModes = ["Show all", "Show only..."];

export const mappingFilterOptionToFilterFunction = {
  "is scheduled": (each) => each.row !== -1 && each.col !== -1,
  "is unscheduled": (each) => each.row === -1 && each.col === -1,

  "is completed": (mondayKey) => (each) => mondayKey in each.isCompleted,
  "is incomplete": (mondayKey) => (each) => !(mondayKey in each.isCompleted),

  "is recurring": (each) => each.dueDate === "--",
  "is one-off": (each) => each.dueDate !== "--",
};

export default filteringTasksSlice.reducer;
