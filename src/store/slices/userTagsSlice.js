import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { resetReduxStore } from "../storeHelpers/actions";
import { renameTagInFilterOptions } from "./filteringTasksSlice";
import {
  addTagToTheme,
  deleteTagInTheme,
  renameTagInTheme,
} from "./mappingTagToColourNameSlice";
import { deleteTask, updateTaskFields } from "./tasksSlice";

const initialState = ["Others"];

const userTagsSlice = createSlice({
  name: "userTags",
  initialState,
  reducers: {
    _setUserTags: (state, action) => action.payload,
    _addUserTag: (state, action) => {
      const newTag = action.payload;
      state.push(newTag);
      return state;
    },
    _deleteUserTag: (state, action) => {
      const tags = state;
      const tagToBeDeleted = action.payload;

      const index = tags.findIndex((tag) => tag === tagToBeDeleted);
      tags.splice(index, 1);
      return state;
    },
    _renameUserTag: (state, action) => {
      const tags = state;
      const { oldTagName, newTagName } = action.payload;

      const index = tags.findIndex((tag) => tag === oldTagName);

      // replace oldTagName with newTagName
      tags.splice(index, 1, newTagName);

      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { _setUserTags } = userTagsSlice.actions;

const { _addUserTag, _deleteUserTag, _renameUserTag } = userTagsSlice.actions;

export function addUserTag(userTag) {
  return function thunk(dispatch, getState) {
    dispatch(_addUserTag(userTag));
    dispatch(addTagToTheme(userTag));
    dispatch(addUserTagToDatabase(userTag));
  };
}

export function deleteUserTag(userTag, deleteMode) {
  return function thunk(dispatch, getState) {
    const tasks = getState().tasks.data;

    switch (deleteMode) {
      case "CONVERT_ASSOCIATED_TASKS_TO_OTHERS":
        for (const task of tasks) {
          const { _id, tag } = task;

          if (tag === userTag) {
            dispatch(updateTaskFields(_id, { tag: "Others" }));
          }
        }
        break;
      case "DELETE_ASSOCIATED_TASKS":
        for (const task of tasks) {
          const { _id, tag } = task;

          if (tag === userTag) {
            dispatch(deleteTask(_id));
          }
        }
        break;
      default:
        throw new Error("Invalid deleteMode");
    }

    dispatch(_deleteUserTag(userTag));
    dispatch(deleteTagInTheme(userTag));
    dispatch(updateUserTagsInDatabase());
  };
}

export function renameUserTag(oldTagName, newTagName) {
  return function thunk(dispatch, getState) {
    // ========================================================================
    // update `tag` field in tasks
    // ========================================================================

    const tasks = getState().tasks.data;

    for (const task of tasks) {
      const { _id, tag } = task;

      if (tag === oldTagName) {
        dispatch(updateTaskFields(_id, { tag: newTagName }));
      }
    }

    const payload = { oldTagName, newTagName };
    dispatch(_renameUserTag(payload));
    dispatch(renameTagInTheme(oldTagName, newTagName));
    dispatch(renameTagInFilterOptions(oldTagName, newTagName));
    dispatch(updateUserTagsInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const addUserTagToDatabase = createAsyncThunk(
  "userTags/addUserTagToDatabase",
  async (userTag, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/userTags", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userTag }),
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

const updateUserTagsInDatabase = createAsyncThunk(
  "userTags/updateUserTagsInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const userTags = getState().userTags;

    try {
      const res = await fetch("/api/private/userTags", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, userTags }),
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

export default userTagsSlice.reducer;
