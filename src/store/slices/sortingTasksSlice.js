import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = {
  sortBy: "Date created (oldest)",
};

const sortingTasksSlice = createSlice({
  name: "sortingTasks",
  initialState,
  reducers: {
    _setState: (state, action) => action.payload,
    _setSortBy: (state, action) => {
      state.sortBy = action.payload;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => {
      window.localStorage.removeItem("sortBy");
      return initialState;
    });
  },
});

const { _setState, _setSortBy } = sortingTasksSlice.actions;

export function setSortBy(sortBy) {
  return function thunk(dispatch, getState) {
    dispatch(_setSortBy(sortBy));

    // store entire state object into local storage
    window.localStorage.setItem(
      "sortBy",
      JSON.stringify(getState().sortingTasks)
    );
  };
}

export function getSortByFromLocalStorage() {
  return function thunk(dispatch, getState) {
    // recover entire state object from local storage
    const state = window.localStorage.getItem("sortBy");

    if (state === null) {
      return;
    }

    dispatch(_setState(JSON.parse(state)));
  };
}

export const mappingSortByToSortFunction = {
  "Name (A - Z)": (firstTask, secondTask) => {
    const firstName = firstTask.name.toUpperCase();
    const secondName = secondTask.name.toUpperCase();

    if (firstName < secondName) {
      return -1;
    }

    if (firstName > secondName) {
      return 1;
    }

    return 0;
  },
  "Name (Z - A)": (firstTask, secondTask) => {
    const firstName = firstTask.name.toUpperCase();
    const secondName = secondTask.name.toUpperCase();

    if (firstName < secondName) {
      return 1;
    }

    if (firstName > secondName) {
      return -1;
    }

    return 0;
  },
  "Due date": (firstTask, secondTask) => {
    const firstEpochDueTime = getEpochDueTime(firstTask);
    const secondEpochDueTime = getEpochDueTime(secondTask);

    if (firstEpochDueTime < secondEpochDueTime) {
      return -1;
    }

    if (firstEpochDueTime > secondEpochDueTime) {
      return 1;
    }

    return 0;
  },
  "Module code": (firstTask, secondTask) => {
    const firstModuleCode = firstTask.moduleCode;
    const secondModuleCode = secondTask.moduleCode;

    if (firstModuleCode < secondModuleCode) {
      return -1;
    }

    if (firstModuleCode > secondModuleCode) {
      return 1;
    }

    return 0;
  },
  "Date created (newest)": 0,
  "Date created (oldest)": 0,
  "Task duration (longest)": (firstTask, secondTask) => {
    const firstTimeUnits = firstTask.timeUnits;
    const secondTimeUnits = secondTask.timeUnits;

    if (firstTimeUnits < secondTimeUnits) {
      return 1;
    }

    if (firstTimeUnits > secondTimeUnits) {
      return -1;
    }

    return 0;
  },
  "Task duration (shortest)": (firstTask, secondTask) => {
    const firstTimeUnits = firstTask.timeUnits;
    const secondTimeUnits = secondTask.timeUnits;

    if (firstTimeUnits < secondTimeUnits) {
      return -1;
    }

    if (firstTimeUnits > secondTimeUnits) {
      return 1;
    }

    return 0;
  },
};

function getEpochDueTime(task) {
  const { dueDate, dueTime } = task;

  if (dueDate === "--") {
    return 0;
  }

  const [year, month, date] = dueDate.split("-");
  const [hour, min] = dueTime.split(":");

  // need to convert `month` back to 0-index for Date constructor to work
  const epochDueTime = new Date(year, month - 1, date, hour, min).getTime();
  return epochDueTime;
}

export default sortingTasksSlice.reducer;
