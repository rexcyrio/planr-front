import { createSlice } from "@reduxjs/toolkit";

const timetableSlice = createSlice({
  name: "timetable",
  initialState: () => {
    const arr = [];

    for (let i = 0; i < 48; i++) {
      const row = ["0", "0", "0", "0", "0", "0", "0"];
      arr.push(row);
    }

    return arr;
  },
  reducers: {
    _setMatrix: (state, action) => {
      const prevMatrix = state;
      const values = action.payload;

      // deep copy
      const newMatrix = [];
      for (const prevRow of prevMatrix) {
        newMatrix.push([...prevRow]);
      }

      for (const value of values) {
        const [row, col, el] = value;

        // silently ignore out of range indices
        if (row < 0 || row >= 48 || col < 0 || col >= 7) {
          continue;
        }

        newMatrix[row][col] = el;
      }

      return newMatrix;
    },
  },
});

// private function
const { _setMatrix } = timetableSlice.actions;

function setMatrix(values) {
  return async function thunk(dispatch, getState) {
    dispatch(_setMatrix(values));
    // TODO: update database
  };
}

export { timetableSlice, setMatrix };
export default timetableSlice.reducer;
