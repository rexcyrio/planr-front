import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import formatErrorMessage from "../../helper/formatErrorMessage";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER,
} from "../storeHelpers/statusHelpers";
import { setMatrix, _setMatrixFromDatabase } from "./matrixSlice";
import { _setModules } from "./modulesSlice";

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
      console.log(newKeyValuePairs);

      // cannot update fields of EMPTY_TASK
      if (taskId === "0") {
        return state;
      }

      const index = tasks.findIndex((each) => each._id === taskId);
      for (const [key, value] of Object.entries(newKeyValuePairs)) {
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
    _deleteCompletedTasks: (state) => {
      const tasks = state.data;

      const cleanedTasks = tasks.filter((each) => !each.isCompleted);
      state.data = cleanedTasks;
      return state;
    },
    _saveEditedTasksLinks: (state, action) => {
      const newLinks = action.payload;
      for (const link of newLinks) {
        if (link.name === "") {
          link.name = link.url;
        }

        let finalURL = link.url;
        if (
          !link.url.startsWith("https://") &&
          !link.url.startsWith("http://")
        ) {
          finalURL = "http://".concat(link.url);
        }

        const newLink = {
          ...link,
          url: finalURL,
        };
        loop2: for (const task of state.data) {
          for (let i = 0; i < task.links.length; i++) {
            if (link._id === task.links[i]._id) {
              if (link._toBeDeleted) {
                task.links = task.links.filter((each) => each._id !== link._id);
              } else {
                task.links[i] = newLink;
              }
              break loop2;
            }
          }
        }
      }
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

export const { _setTasks } = tasksSlice.actions;

// private functions
const {
  _addTask,
  _updateTaskFields,
  _deleteTask,
  _deleteCompletedTasks,
  _saveEditedTasksLinks,
} = tasksSlice.actions;

export function addTask(newTask) {
  return function thunk(dispatch, getState) {
    dispatch(_addTask(newTask));
    dispatch(addTaskToDatabase(newTask));
  };
}

export function updateTaskFields(taskId, newKeyValuePairs) {
  return function thunk(dispatch, getState) {
    const payload = {
      taskId: taskId,
      newKeyValuePairs: newKeyValuePairs,
    };

    dispatch(_updateTaskFields(payload));
    dispatch(updateTasksInDatabase());
  };
}

export function deleteTask(taskId) {
  return function thunk(dispatch, getState) {
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
  return function thunk(dispatch, getState) {
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

export function saveEditedTasksLinks(newTasksLinks) {
  return function thunk(dispatch, getState) {
    dispatch(_saveEditedTasksLinks(newTasksLinks));
    dispatch(updateTasksInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { dispatch, getState }) => {
    const { userId } = getState().user;

    try {
      const items = await Promise.all([
        getItemFromDatabase("tasks", userId),
        getItemFromDatabase("modules", userId),
        getItemFromDatabase("timetable", userId),
      ]);

      const [databaseTasks, databaseModules, databaseTimetable] = items;

      dispatch(_setTasks(databaseTasks));
      dispatch(_setModules(databaseModules));
      dispatch(_setMatrixFromDatabase(databaseTimetable));
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

async function getItemFromDatabase(type, userId) {
  const res = await fetch(`/api/private/${type}?id=${userId}`);
  const json = await res.json();

  if (json.error) {
    throw new Error(formatErrorMessage(json.error));
  }

  return json[type];
}

const updateTasksInDatabase = createAsyncThunk(
  "tasks/updateTasksInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const tasks = getState().tasks.data;

    try {
      const res = await fetch("/api/private/tasks", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, tasks }),
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

const addTaskToDatabase = createAsyncThunk(
  "tasks/addTaskToDatabase",
  async (task, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/tasks", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, task }),
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

export default tasksSlice.reducer;
