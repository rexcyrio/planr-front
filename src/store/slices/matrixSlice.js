import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = (() => {
  const arr = [];

  for (let i = 0; i < 48; i++) {
    const row = ["0", "0", "0", "0", "0", "0", "0"];
    arr.push(row);
  }

  return arr;
})();

const matrixSlice = createSlice({
  name: "matrix",
  initialState,
  reducers: {
    _setMatrix: (state, action) => {
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

// private function
const { _setMatrix } = matrixSlice.actions;

export function setMatrix(values) {
  return async function thunk(dispatch, getState) {
    dispatch(_setMatrix(values));
    dispatch(updateTimetableInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const updateTimetableInDatabase = createAsyncThunk(
  "matrix/updateTimetableInDatabase",
  async (_, { getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;
      const newMatrix = getState().matrix.data

      fetch("/api/private/timetable", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, timetable: newMatrix }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
            alert(json.error);
            reject(json.error);
          }

          resolve();
        });
    });
  }
);

export default matrixSlice.reducer;
