import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER
} from "../storeHelpers/statusHelpers";
import { setMatrix, _setMatrixFromDatabase } from "./matrixSlice";

const initialState = {
  data: [],
  status: FETCHING,
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    _setTasks: (state, action) => {
      state.data = action.payload;
      return state;
    },
    _addTask: (state, action) => {
      const newTask = action.payload;
      state.data.push(newTask);
      return state;
    },
    _updateTaskFields: (state, action) => {
      const tasks = state.data;
      const { taskId, newKeyValuePairs } = action.payload;

      // cannot update fields of EMPTY_TASK
      if (taskId === "0") {
        return state;
      }

      const index = tasks.findIndex((each) => each._id === taskId);
      for (const [key, value] of newKeyValuePairs) {
        tasks[index][key] = value;
      }

      return state;
    },
    _deleteTask: (state, action) => {
      const tasks = state.data;
      const taskId = action.payload;

      const index = tasks.findIndex((each) => each._id === taskId);
      tasks.splice(index, 1);
      return state;
    },
    _deleteCompletedTasks: (state, action) => {
      const tasks = state.data;

      const cleanedTasks = tasks.filter((each) => !each.isCompleted);
      state.data = cleanedTasks;
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

// private functions
const {
  _setTasks,
  _addTask,
  _updateTaskFields,
  _deleteTask,
  _deleteCompletedTasks,
} = tasksSlice.actions;

export function addTask(newTask) {
  return async function thunk(dispatch, getState) {
    dispatch(_addTask(newTask));
    dispatch(addTaskToDatabase(newTask));
  };
}

export function updateTaskFields(taskId, newKeyValuePairs) {
  return async function thunk(dispatch, getState) {
    const payload = {
      taskId: taskId,
      newKeyValuePairs: newKeyValuePairs,
    };

    dispatch(_updateTaskFields(payload));
    dispatch(updateTasksInDatabase());
  };
}

export function deleteTask(taskId) {
  return async function thunk(dispatch, getState) {
    const tasks = getState().tasks.data;
    const task = tasks.find((each) => each._id === taskId);
    const { row, col, timeUnits } = task;

    // remove from matrix
    if (row !== -1 && col !== -1) {
      const values = [];

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, "0"]);
      }

      dispatch(setMatrix(values));
    }

    dispatch(_deleteTask(taskId));
    dispatch(updateTasksInDatabase());
  };
}

export function deleteCompletedTasks() {
  return async function thunk(dispatch, getState) {
    const tasks = getState().tasks;
    const completedTasks = tasks.filter((each) => each.isCompleted);

    // remove completed tasks from matrix
    const values = [];
    for (const completedTask of completedTasks) {
      const { row, col, timeUnits } = completedTask;

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, "0"]);
      }
    }

    dispatch(setMatrix(values));
    dispatch(_deleteCompletedTasks());
    dispatch(updateTasksInDatabase());
  };
}

export function markTaskAsComplete(taskId) {
  updateTaskFields(taskId, { isCompleted: true });
}

export function markTaskAsIncomplete(taskId) {
  updateTaskFields(taskId, { isCompleted: false });
}

// ============================================================================
// Database thunks
// ============================================================================

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { dispatch, getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;

      Promise.all([
        getItemFromDatabase("tasks", userId),
        getItemFromDatabase("timetable", userId),
      ])
        .then((items) => {
          const [databaseTasks, databaseTimetable] = items;

          dispatch(_setTasks(databaseTasks));
          dispatch(_setMatrixFromDatabase(databaseTimetable));
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
);

async function getItemFromDatabase(type, userId) {
  return new Promise((resolve, reject) => {
    fetch(`/api/private/${type}?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          reject(json.error);
        }

        resolve(json[type]);
      });
  });
}

const updateTasksInDatabase = createAsyncThunk(
  "tasks/updateTasksInDatabase",
  async (_, { getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;
      const tasks = getState().tasks.data;

      fetch("/api/private/tasks", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, tasks }),
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

const addTaskToDatabase = createAsyncThunk(
  "tasks/addTaskToDatabase",
  async (task, { getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;

      fetch("/api/private/tasks", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, task }),
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

export default tasksSlice.reducer;
