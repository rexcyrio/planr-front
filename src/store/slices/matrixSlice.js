import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";
import { selectCurrentWeekTasks } from "../storeHelpers/selectors";

const initialState = defaultMatrix();

const matrixSlice = createSlice({
  name: "matrix",
  initialState,
  reducers: {
    _refreshMatrix: (state, action) => action.payload,
    setMatrix: (state, action) => {
      const matrix = state;
      const values = action.payload;

      for (const value of values) {
        const [row, col, el] = value;

        // silently ignore out of range indices
        if (row < 0 || row >= 48 || col < 0 || col >= 7) {
          continue;
        }

        matrix[row][col] = el;
      }

      return matrix;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

// available outside to set the values of the matrix directly
export const { setMatrix } = matrixSlice.actions;

// private function
const { _refreshMatrix } = matrixSlice.actions;

export function refreshMatrix() {
  return function thunk(dispatch, getState) {
    const matrix = defaultMatrix();

    const modules = getState().modules;
    const tasks = selectCurrentWeekTasks(getState());

    for (const items of [modules, tasks]) {
      for (const item of items) {
        const { _id, row, col, timeUnits } = item;

        if (row === -1 && col === -1) {
          continue;
        }

        for (let i = 0; i < timeUnits; i++) {
          matrix[row + i][col] = _id;
        }
      }
    }

    dispatch(_refreshMatrix(matrix));
  };
}

export function blackenCells() {
  return function thunk(dispatch, getState) {
    const tasks = getState().tasks.data;
    const occupiedCells = {};

    for (const task of tasks) {
      if (task.dueDate === "--") {
        continue;
      }

      // is normal task
      const { row, col, timeUnits } = task;

      for (let i = 0; i < timeUnits; i++) {
        const str = `${row + i},${col}`;
        occupiedCells[str] = true;
      }
    }

    const values = [];
    for (const value of Object.keys(occupiedCells)) {
      const [row, col] = value.split(",");
      values.push([row, col, "black"]);
    }

    dispatch(setMatrix(values));
  };
}

// ============================================================================
// Helper functions
// ============================================================================

function defaultMatrix() {
  const arr = [];

  for (let i = 0; i < 48; i++) {
    const row = ["0", "0", "0", "0", "0", "0", "0"];
    arr.push(row);
  }

  return arr;
}

export default matrixSlice.reducer;
