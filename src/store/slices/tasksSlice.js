import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { resetReduxStore } from "../storeHelpers/actions";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER,
} from "../storeHelpers/statusHelpers";
import { _setMappingModuleCodeToColourName } from "./mappingModuleCodeToColourNameSlice";
import { refreshMatrix, setMatrix } from "./matrixSlice";
import { _setModules } from "./modulesSlice";
import { _setNUSModsURL } from "./NUSModsURLSlice";
import { setTaskEditorPopupWarningOpen } from "./TaskEditorPopupSlice";
import { _setThemeName } from "./themeNameSlice";

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
    _markTaskAsComplete: (state, action) => {
      const tasks = state.data;
      const { taskId, mondayKey } = action.payload;

      const task = tasks.find((each) => each._id === taskId);
      task.isCompleted[mondayKey] = true;
      return state;
    },
    _markTaskAsIncomplete: (state, action) => {
      const tasks = state.data;
      const { taskId, mondayKey } = action.payload;

      const task = tasks.find((each) => each._id === taskId);
      delete task.isCompleted[mondayKey];
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
    _deleteCompletedTasks: (state, action) => {
      const tasks = state.data;
      const mondayKey = action.payload;

      const cleanedTasks = tasks.filter(
        (each) =>
          each.mondayKey.length === 0 ||
          each.isCompleted[mondayKey] === undefined
      );
      state.data = cleanedTasks;
      return state;
    },
    _saveEditedTasksLinks: (state, action) => {
      const tasks = state.data;
      const newTaskLinks = action.payload;

      const mappingTaskLinkIdToTasksIndex = {};

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const oldTaskLinks = task.links;

        for (const oldTaskLink of oldTaskLinks) {
          const { _id: oldTaskLinkId } = oldTaskLink;
          mappingTaskLinkIdToTasksIndex[oldTaskLinkId] = i;
        }
      }

      const allBuckets = [];
      for (let i = 0; i < tasks.length; i++) {
        allBuckets.push([]);
      }

      for (const newLink of newTaskLinks) {
        if (newLink.name === "") {
          newLink.name = newLink.url;
        }

        if (
          !newLink.url.startsWith("https://") &&
          !newLink.url.startsWith("http://")
        ) {
          newLink.url = "http://" + newLink.url;
        }

        const { _id: newTaskLinkId } = newLink;
        const index = mappingTaskLinkIdToTasksIndex[newTaskLinkId];
        allBuckets[index].push(newLink);
      }

      for (let i = 0; i < allBuckets.length; i++) {
        const bucket = allBuckets[i];
        // state.data          => array of all task items
        // state.data[i]       => a particular task item
        // state.data[i].links => array of links associated with this particular task item
        state.data[i].links = bucket.filter((each) => !each._toBeDeleted);
      }

      return state;
    },
    _unscheduleTasks: (state, action) => {
      const tasks = state.data;
      const taskIds = action.payload;

      const mappingTaskIdToIndex = {};

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        mappingTaskIdToIndex[task._id] = i;
      }

      for (const taskId of taskIds) {
        const index = mappingTaskIdToIndex[taskId];

        // unschedule task
        tasks[index].row = -1;
        tasks[index].col = -1;
      }

      state.data = tasks;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetReduxStore, (state, action) => initialState)

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
  _markTaskAsComplete,
  _markTaskAsIncomplete,
  _updateTaskFields,
  _deleteTask,
  _deleteCompletedTasks,
  _saveEditedTasksLinks,
  _unscheduleTasks,
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
    const tasks = getState().tasks.data;
    const mondayKey = getState().time.mondayKey;
    const completedTasks = tasks.filter(
      (each) =>
        each.mondayKey.length !== 0 && each.isCompleted[mondayKey] !== undefined
    );

    // remove completed tasks from matrix
    const values = [];
    for (const completedTask of completedTasks) {
      const { row, col, timeUnits } = completedTask;

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, "0"]);
      }
    }

    dispatch(setMatrix(values));
    dispatch(_deleteCompletedTasks(mondayKey));
    dispatch(updateTasksInDatabase());
  };
}

export function markTaskAsComplete(taskId) {
  return function thunk(dispatch, getState) {
    const mondayKey = getState().time.mondayKey;
    const payload = { taskId, mondayKey };
    dispatch(_markTaskAsComplete(payload));
  };
}

export function markTaskAsIncomplete(taskId) {
  return function thunk(dispatch, getState) {
    const mondayKey = getState().time.mondayKey;
    const payload = { taskId, mondayKey };
    dispatch(_markTaskAsIncomplete(payload));
  };
}

export function saveEditedTasksLinks(newTasksLinks) {
  return function thunk(dispatch, getState) {
    dispatch(_saveEditedTasksLinks(newTasksLinks));
    dispatch(updateTasksInDatabase());
  };
}

export function unscheduleTasks(taskIds) {
  return function thunk(dispatch, getState) {
    dispatch(_unscheduleTasks(taskIds));
    dispatch(updateTasksInDatabase());
  };
}

export function saveEditedTask(self, newTask, autoUnscheduleSelf, handleClose) {
  return function thunk(dispatch, getState) {
    const matrix = getState().matrix;

    function canExpand(row, col, timeUnits, diff) {
      if (row - 1 + timeUnits + diff >= 48) {
        return false;
      }

      for (let i = 0; i < diff; i++) {
        if (matrix[row + timeUnits + i][col] !== "0") {
          return false;
        }
      }
      return true;
    }

    const { _id: taskId, row, col } = newTask;

    if (row !== -1 && col !== -1) {
      // updating matrix
      if (newTask.timeUnits < self.timeUnits) {
        // case 1: user shortened time needed for task
        const diff = self.timeUnits - newTask.timeUnits;
        const values = [];

        for (let i = 0; i < diff; i++) {
          values.push([row + newTask.timeUnits + i, col, "0"]);
        }

        dispatch(setMatrix(values));
      } else if (newTask.timeUnits === self.timeUnits) {
        // do nothing
      } else if (newTask.timeUnits > self.timeUnits) {
        // check whether there is enough available time units to expand
        const diff = newTask.timeUnits - self.timeUnits;

        if (canExpand(row, col, self.timeUnits, diff)) {
          // case 2: user lengthened time needed for task, enough available time units
          // ==> update matrix
          const values = [];

          for (let i = 0; i < diff; i++) {
            values.push([row + self.timeUnits + i, col, taskId]);
          }

          dispatch(setMatrix(values));
        } else {
          // case 3: user lengthened time needed for task, NOT enough available time units

          if (!autoUnscheduleSelf) {
            // warn user
            dispatch(setTaskEditorPopupWarningOpen(true));
            return;
          }

          dispatch(setTaskEditorPopupWarningOpen(false));

          // ==> unschedule task from timetable
          const values = [];

          for (let i = 0; i < self.timeUnits; i++) {
            values.push([row + i, col, "0"]);
          }

          dispatch(setMatrix(values));
          newTask.row = -1;
          newTask.col = -1;
        }
      }
    }

    // updating tasks array
    dispatch(updateTaskFields(taskId, newTask));
    handleClose();
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

        getItemFromDatabase("NUSModsURL", userId),
        getItemFromDatabase("themeName", userId),
        getItemFromDatabase("mappingModuleCodeToColourName", userId),
      ]);

      const [
        databaseTasks,
        databaseModules,

        databaseNUSModsURL,
        databaseThemeName,
        databaseMappingModuleCodeToColourName,
      ] = items;

      dispatch(_setTasks(databaseTasks));
      dispatch(_setModules(databaseModules));

      dispatch(_setNUSModsURL(databaseNUSModsURL));
      dispatch(_setThemeName(databaseThemeName));
      dispatch(
        _setMappingModuleCodeToColourName(databaseMappingModuleCodeToColourName)
      );

      // refresh the matrix after fetching the task and module objects from database
      dispatch(refreshMatrix());
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
