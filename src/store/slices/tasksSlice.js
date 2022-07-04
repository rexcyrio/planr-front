import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER,
} from "../storeHelpers/statusHelpers";
import { rebuildMatrix, setMatrix } from "./matrixSlice";

////////////////////////////////////////////////////////////////////////////////
// Slice
////////////////////////////////////////////////////////////////////////////////

const initialState = {
  data: [],
  status: FETCHING,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      state.data = action.payload;
      return state;
    },
    addTask: (state, action) => {
      state.data.push(action.payload);
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, FETCHING_REDUCER)
      .addCase(fetchTasks.fulfilled, FETCH_SUCCESS_REDUCER)
      .addCase(fetchTasks.rejected, FETCH_FAILURE_REDUCER)

      .addCase(updateTasksInDatabase.pending, UPDATING_REDUCER)
      .addCase(updateTasksInDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(updateTasksInDatabase.rejected, UPDATE_FAILURE_REDUCER)

      .addCase(addTaskToDatabase.pending, UPDATING_REDUCER)
      .addCase(addTaskToDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(addTaskToDatabase.rejected, UPDATE_FAILURE_REDUCER);
  },
});

////////////////////////////////////////////////////////////////////////////////
// Tasks state thunks
////////////////////////////////////////////////////////////////////////////////

export const updateTaskFields = (taskID, newKeyValuePairs) => {
  return (dispatch, getState) => {
    dispatch(startUpdate());
    if (taskID === "0") {
      return;
    }

    const task = getState().tasks.data.find((each) => each._id === taskID);
    const newTask = {};

    for (const [key, value] of Object.entries(task)) {
      if (key in newKeyValuePairs) {
        newTask[key] = newKeyValuePairs[key];
      } else {
        newTask[key] = value;
      }
    }

    dispatch(updateTasks(taskID, newTask));
  };
};

export const taskAddition = (newTask) => {
  return (dispatch) => {
    dispatch(startUpdate());
    dispatch(addTask(newTask));
    dispatch(addTaskToDatabase(newTask));
  };
};

export const deleteTask = (task) => {
  return (dispatch, getState) => {
    dispatch(startUpdate());
    const { _id: taskID, row, col, timeUnits } = task;

    // cannot delete EMPTY_TASK
    if (taskID === "0") {
      return;
    }

    // remove from matrix
    if (row !== -1 && col !== -1) {
      const values = [];

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, "0"]);
      }

      dispatch(rebuildMatrix(values));
    }

    // remove from tasks array
    const tasks = getState().tasks.data;
    const newTasks = tasks.filter((each) => each._id !== taskID);
    dispatch(setTasks(newTasks));
    dispatch(updateTasksInDatabase(newTasks));
  };
};

export const deleteCompletedTask = () => {
  return (dispatch, getState) => {
    dispatch(startUpdate());
    const tasks = getState().tasks.data;
    const newTasks = tasks.filter((each) => each.isCompleted === false);
    const doneTasks = tasks.filter((each) => each.isCompleted === true);
    let values = [];
    for (const task of doneTasks) {
      for (let i = 0; i < task.timeUnits; i++) {
        values.push([task.row + i, task.col, "0"]);
      }
    }
    dispatch(rebuildMatrix(values));
    dispatch(setTasks(newTasks));
    dispatch(updateTasksInDatabase(newTasks));
  };
};

export const updateTasks = (taskID, newTask) => {
  return (dispatch, getState) => {
    dispatch(startUpdate());
    const tasks = getState().tasks.data;
    const index = tasks.findIndex((each) => each._id === taskID);
    const newTasks = [
      ...tasks.slice(0, index),
      newTask,
      ...tasks.slice(index + 1),
    ];
    dispatch(setTasks(newTasks));
    dispatch(updateTasksInDatabase(newTasks));
  };
};

////////////////////////////////////////////////////////////////////////////////
// Database thunks
////////////////////////////////////////////////////////////////////////////////

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { dispatch, getState }) => {
    const userId = getState().user.userId;
    const items = await Promise.all([
      getItemFromDatabase("tasks", userId),
      getItemFromDatabase("timetable", userId),
    ]);

    const [databaseTasks, databaseTimetable] = items;

    // need add error?
    dispatch(setTasks(databaseTasks));
    dispatch(setMatrix(databaseTimetable));
  }
);

async function getItemFromDatabase(type, userId) {
  return new Promise((resolve, reject) => {
    fetch(`/api/private/${type}?id=${userId}`)
      .then((res) => res.json())
      .then((json) => resolve(json[type]));
  });
}

export const updateTasksInDatabase = createAsyncThunk(
  "tasks/updateTasksInDatabase",
  async (tasks, { getState }) => {
    const userId = getState().user.userId;
    const res = await fetch("/api/private/tasks", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, tasks }),
    });
    const json = res.json();

    if (json.error) {
      alert(json.error);
      throw new Error(json.error);
    }

    return json;
  }
);

export const addTaskToDatabase = createAsyncThunk(
  "tasks/addTaskToDatabase",
  async (task, { getState }) => {
    const userId = getState().user.userId;
    const res = await fetch("/api/private/tasks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, task }),
    });
    const json = res.json();

    if (json.error) {
      alert(json.error);
      throw new Error(json.error);
    }

    return json;
  }
);

export const { setTasks, addTask, startUpdate } = tasksSlice.actions;

// // private functions
// const { _addTask, _updateTaskFields, _deleteTask, _deleteCompletedTasks } =
//   tasksSlice.actions;

// function addTask(newTask) {
//   return async function thunk(dispatch, getState) {
//     dispatch(_addTask(newTask));
//     // TODO: update database
//     databaseHelper(dispatch, getState, "POST", "task", newTask);
//   };
// }

// function markTaskAsComplete(taskId) {
//   updateTaskFields(taskId, { isCompleted: true });
// }

// function markTaskAsIncomplete(taskId) {
//   updateTaskFields(taskId, { isCompleted: false });
// }

// function updateTaskFields(taskId, newKeyValuePairs) {
//   return async function thunk(dispatch, getState) {
//     const payload = {
//       taskId: taskId,
//       newKeyValuePairs: newKeyValuePairs,
//     };

//     dispatch(_updateTaskFields(payload));
//     // TODO: update database
//   };
// }

// function deleteTask(taskId) {
//   return async function thunk(dispatch, getState) {
//     dispatch(_deleteTask(taskId));
//     // TODO: update database
//   };
// }

// function deleteCompletedTasks() {
//   return async function thunk(dispatch, getState) {
//     const tasks = getState().tasks;
//     const completedTasks = tasks.filter((each) => each.isCompleted);

//     // remove completed tasks from timetable matrix
//     const values = [];
//     for (const completedTask of completedTasks) {
//       const { row, col, timeUnits } = completedTask;

//       for (let i = 0; i < timeUnits; i++) {
//         values.push(row + i, col, "0");
//       }
//     }

//     dispatch(setMatrix(values));
//     dispatch(_deleteCompletedTasks());
//     // TODO: update database
//   };
// }

// function databaseHelper(dispatch, getState, httpVerb, key, value) {
//   if (
//     httpVerb !== "GET" &&
//     httpVerb !== "PUT" &&
//     httpVerb !== "POST" &&
//     httpVerb !== "DELETE"
//   ) {
//     throw Error("Invalid HTTP verb");
//   }

//   const { userId } = getState().user;
//   let pluralType = "";

//   if (key === "link" || key === "note" || key === "task") {
//     pluralType = key + "s";
//   } else if (key === "links" || key === "notes" || key === "tasks") {
//     pluralType = key;
//   }

//   dispatch(updateDataStatus({ [pluralType]: "UPDATING" }));

//   fetch(`/api/private/${pluralType}`, {
//     method: httpVerb,
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ userId: userId, [key]: value }),
//   })
//     .then((res) => res.json())
//     .then((json) => {
//       if (json.error) {
//         dispatch(updateDataStatus({ [pluralType]: "OUT_OF_SYNC" }));
//         alert(json.error);
//         return;
//       }

//       dispatch(updateDataStatus({ [pluralType]: "IN_SYNC" }));
//     });
// }

// export {
//   tasksSlice,
//   addTask,
//   updateTaskFields,
//   deleteTask,
// };
export default tasksSlice.reducer;

// ============

// setTasks: (state, action) => action.payload,
// _addTask: (state, action) => {
//   const newTask = action.payload;
//   return [...state, newTask];
// },
// _updateTaskFields: (state, action) => {
//   const { taskId, newKeyValuePairs } = action.payload;

//   // cannot update fields of EMPTY_TASK
//   if (taskId === "0") {
//     return state;
//   }

//   // deep copy
//   const tasks = state;
//   const newTasks = [];
//   for (const task of tasks) {
//     if (task._id !== taskId) {
//       newTasks.push({ ...task });
//       continue;
//     }

//     const newTask = {};

//     for (const [key, value] of Object.entries(task)) {
//       if (key in newKeyValuePairs) {
//         newTask[key] = newKeyValuePairs[key];
//       } else {
//         newTask[key] = value;
//       }
//     }

//     newTasks.push(newTask);
//   }

//   return newTasks;
// },
// _deleteTask: (state, action) => {
//   const tasks = state;
//   const taskId = action.payload;
//   return tasks.filter((each) => each._id !== taskId);
// },
// _deleteCompletedTasks: (state, action) => {
//   const tasks = state;
//   return tasks.filter((each) => !each.isCompleted);
