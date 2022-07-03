import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { rebuildMatrix, setMatrix } from "./matrixSlice";

////////////////////////////////////////////////////////////////////////////////
// Case reducers(might move to helper for reuse)
////////////////////////////////////////////////////////////////////////////////

const outOfSync = (state) => {
  state.status = "OUT_OF_SYNC";
};

const inSync = (state) => {
  state.status = "IN_SYNC";
};

////////////////////////////////////////////////////////////////////////////////
// Slice
////////////////////////////////////////////////////////////////////////////////

const initialState = {
  data: [],

  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  status: "INITIAL_LOAD",
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
    startUpdate: (state) => {
      state.status = "UPDATING";
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "INITIAL_LOAD";
      })
      .addCase(fetchTasks.fulfilled, (state) => {
        state.status = "IN_SYNC";
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.status = "LOAD_FAILED";
      })
      .addCase(updateTasksInDatabase.fulfilled, inSync)
      .addCase(updateTasksInDatabase.rejected, outOfSync)
      .addCase(addTaskToDatabase.fulfilled, inSync)
      .addCase(addTaskToDatabase.rejected, outOfSync);
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

export default tasksSlice.reducer;
