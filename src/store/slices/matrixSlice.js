import { createSlice } from "@reduxjs/toolkit";

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
});

// available outside to set the values of the matrix directly
export const { setMatrix } = matrixSlice.actions;

// private function
const { _refreshMatrix } = matrixSlice.actions;


export function refreshMatrix() {
  return function thunk(dispatch, getState) {
    const matrix = defaultMatrix();

    // TODO: time slice
    const modules = getState().modules;
    const tasks = getState().tasks.data;

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
