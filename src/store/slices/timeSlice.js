import { createSlice } from "@reduxjs/toolkit";
import { refreshMatrix } from "./matrixSlice";

const initialState = {
  timetableColumn: getCurrentColumn(),
  mondayKey: getMondayKey(new Date()),
};

const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    _setTimetableColumn: (state, action) => {
      state.timetableColumn = action.payload;
      return state;
    },
    _goToToday: (state, action) => {
      state.mondayKey = getMondayKey(new Date());
      return state;
    },
    _goToNextWeek: (state, action) => {
      const mondayKey = state.mondayKey;
      const [dateNumber, monthNumber, yearNumber] = mondayKey;

      const dateObject = new Date(yearNumber, monthNumber, dateNumber + 7);
      state.mondayKey = convertToKey(dateObject);
      return state;
    },
    _goToPreviousWeek: (state, action) => {
      const mondayKey = state.mondayKey;
      const [dateNumber, monthNumber, yearNumber] = mondayKey;

      const dateObject = new Date(yearNumber, monthNumber, dateNumber - 7);
      state.mondayKey = convertToKey(dateObject);
      return state;
    },
  },
});

// private function
const { _setTimetableColumn, _goToToday, _goToNextWeek, _goToPreviousWeek } =
  timeSlice.actions;

export function setTimetableColumn() {
  return function thunk(dispatch) {
    const newTimetableColumn = getCurrentColumn();
    dispatch(_setTimetableColumn(newTimetableColumn));
  };
}

export function goToToday() {
  return function thunk(dispatch) {
    dispatch(_goToToday());
    dispatch(refreshMatrix());
  };
}

export function goToNextWeek() {
  return function thunk(dispatch) {
    dispatch(_goToNextWeek());
    dispatch(refreshMatrix());
  };
}

export function goToPreviousWeek() {
  return function thunk(dispatch) {
    dispatch(_goToPreviousWeek());
    dispatch(refreshMatrix());
  };
}

export function getMondayKey(dateObject) {
  const day = dateObject.getDay();

  if (day === 0) {
    // is Sunday
    const monday = new Date(
      new Date(dateObject).setDate(dateObject.getDate() - 6)
    );
    return convertToKey(monday);
  } else if (day === 1) {
    // is Monday
    return convertToKey(dateObject);
  } else {
    // is other days of the week
    const monday = new Date(
      new Date(dateObject).setDate(dateObject.getDate() - (day - 1))
    );
    return convertToKey(monday);
  }
}

// ============================================================================
// Helper functions
// ============================================================================

function getCurrentColumn() {
  const date = new Date();
  return date.getDay() === 0 ? 6 : date.getDay() - 1;
}

function convertToKey(dateObject) {
  const dateNumber = dateObject.getDate();
  const monthNumber = dateObject.getMonth();
  const yearNumber = dateObject.getFullYear();

  return [dateNumber, monthNumber, yearNumber];
}

export default timeSlice.reducer;
