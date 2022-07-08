import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";

const initialState = [];

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    _setModules: (state, action) => {
      return action.payload;
    },
    _saveEditedModulesLinks: (state, action) => {
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
        loop2: for (const module of state) {
          for (let i = 0; i < module.links.length; i++) {
            if (link._id === module.links[i]._id) {
              if (link._toBeDeleted) {
                module.links = module.links.filter(
                  (each) => each._id !== link._id
                );
              } else {
                module.links[i] = newLink;
              }
              break loop2;
            }
          }
        }
      }
      return state;
    },
  },
});

export const { _setModules, _saveEditedModulesLinks } = modulesSlice.actions;

// get state in updateDB func?
export function setModules(newModuleItems) {
  return function thunk(dispatch, getState) {
    dispatch(_setModules(newModuleItems));
    dispatch(setModulesInDatabase(newModuleItems));
  };
}

export function saveEditedModulesLinks(newTasksLinks) {
  return function thunk(dispatch, getState) {
    dispatch(_saveEditedModulesLinks(newTasksLinks));
    dispatch(setModulesInDatabase(getState().modules));
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const setModulesInDatabase = createAsyncThunk(
  "tasks/setModulesInDatabase",
  async (modules, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/modules", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, modules }),
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

export default modulesSlice.reducer;
