import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

function defaultMatrix(val) {
  const arr = [];
  for (let i = 0; i < 48; i++) {
    const row = [val, val, val, val, val, val, val];
    arr.push(row);
  }
  return arr;
}

////////////////////////////////////////////////////////////////////////////////
// Slice
////////////////////////////////////////////////////////////////////////////////

const initialState = defaultMatrix("0");

const matrixSlice = createSlice({
  name: "matrix",
  initialState,
  reducers: {
    setMatrix: (state, action) => {
      state = action.payload;
      return state;
    },
  },
  // extraReducers: (builder) => {
  //   builder.addCase(updateTimetableInDatabase.rejected, (state, action) => {
  //     console.log(action.payload);

  //   });
  // },
});

////////////////////////////////////////////////////////////////////////////////
// Matrix state thunks
////////////////////////////////////////////////////////////////////////////////

export const rebuildMatrix = (values) => {
  return (dispatch, getState) => {
    const matrix = getState().matrix;
    const newMatrix = [];

    // deep copy
    for (const prevRow of matrix) {
      newMatrix.push([...prevRow]);
    }

    for (const value of values) {
      const [row, col, el] = value;

      // silently ignore out of range indices
      if (row < 0 || row >= 48 || col < 0 || col >= 7) {
        continue;
      }

      // skip unnecessary updates
      if (newMatrix[row][col] === el) {
        continue;
      }

      newMatrix[row][col] = el;
    }

    dispatch(setMatrix(newMatrix));
    dispatch(updateTimetableInDatabase(newMatrix));
  };
};

////////////////////////////////////////////////////////////////////////////////
// Database
////////////////////////////////////////////////////////////////////////////////

const updateTimetableInDatabase = createAsyncThunk(
  "matrix/updateTimetableInDatabase",
  async (newMatrix, { getState }) => {
    const userId = getState().user.userId;
    const res = await fetch("/api/private/timetable", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, timetable: newMatrix }),
    });
    const json = res.json();
    if (json.error) {
      alert(json.error);
      throw new Error(json.error);
    }

    return json;
  }
);

export const { setMatrix } = matrixSlice.actions;

export default matrixSlice.reducer;

// ============================================================================
// ============================================================================

// const timetableSlice = createSlice({
//   name: "timetable",
//   initialState: () => {
//     const arr = [];

//     for (let i = 0; i < 48; i++) {
//       const row = ["0", "0", "0", "0", "0", "0", "0"];
//       arr.push(row);
//     }

//     return arr;
//   },
//   reducers: {
//     _setMatrix: (state, action) => {
//       const prevMatrix = state;
//       const values = action.payload;

//       // deep copy
//       const newMatrix = [];
//       for (const prevRow of prevMatrix) {
//         newMatrix.push([...prevRow]);
//       }

//       for (const value of values) {
//         const [row, col, el] = value;

//         // silently ignore out of range indices
//         if (row < 0 || row >= 48 || col < 0 || col >= 7) {
//           continue;
//         }

//         newMatrix[row][col] = el;
//       }

//       return newMatrix;
//     },
//   },
// });

// // private function
// const { _setMatrix } = timetableSlice.actions;

// function setMatrix(values) {
//   return async function thunk(dispatch, getState) {
//     dispatch(_setMatrix(values));
//     // TODO: update database
//   };
// }

// export { timetableSlice, setMatrix };
// export default timetableSlice.reducer;
