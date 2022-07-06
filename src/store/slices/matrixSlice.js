import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";

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
    _setMatrixFromDatabase: (state, action) => action.payload,
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

// should only be used inside `tasksSlice` to set the matrix after fetching
export const { _setMatrixFromDatabase } = matrixSlice.actions;

// private function
const { _setMatrix } = matrixSlice.actions;

export function setMatrix(values) {
  return function thunk(dispatch, getState) {
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
    const { userId } = getState().user;
    const newMatrix = getState().matrix;

    try {
      const res = await fetch("/api/private/timetable", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, timetable: newMatrix }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

export default matrixSlice.reducer;
