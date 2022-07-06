const { createSlice } = require("@reduxjs/toolkit");

// ============================================================================
// Time helper functions
// ============================================================================

function currentColumn() {
  const date = new Date();
  return date.getDay() === 0 ? 6 : date.getDay() - 1;
}

function currentWeek() {
  const dateObject = new Date();
  const day = dateObject.getDay() === 0 ? 6 : dateObject.getDay() - 1;
  const date = dateObject.getDate();
  const mondayDate = date - day;
  const week =
    mondayDate.toString() +
    dateObject.getMonth.toString() +
    dateObject.getFullYear.toString();
  return week;
}

// ============================================================================
// Slice
// ============================================================================

const initialState = { timetableColumn: currentColumn(), week: currentWeek() };

const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    _setTimetableColumn: (state, action) => {
      state.timetableColumn = action.payload;
    },
    _setWeek: (state, action) => {
      state.timetableColumn = action.payload;
    },
  },
});

export function setTimetableColumn() {
  return function thunk(dispatch) {
    const newTimetableColumn = currentColumn();
    dispatch(setTimetableColumn(newTimetableColumn));
  };
}

export const { _setWeek } = timeSlice.actions;

export default timeSlice.reducer;
