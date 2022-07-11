import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = [];

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    _setModules: (state, action) => action.payload,
    _addModuleLinks: (state, action) => {
      const modules = state;
      const { moduleCode, links } = action.payload;

      for (const module of modules) {
        if (module.moduleCode === moduleCode) {
          module.links = links;
          return state;
        }
      }
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
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { _setModules } = modulesSlice.actions;

const { _addModuleLinks, _saveEditedModulesLinks } = modulesSlice.actions;

export function setModules(newModuleItems) {
  return function thunk(dispatch, getState) {
    dispatch(_setModules(newModuleItems));
    dispatch(setModulesInDatabase());
  };
}

export function addModuleLinks(moduleCode, links) {
  return function thunk(dispatch, getState) {
    const payload = { moduleCode, links };
    dispatch(_addModuleLinks(payload));
    dispatch(setModulesInDatabase());
  };
}

export function saveEditedModulesLinks(newTasksLinks) {
  return function thunk(dispatch, getState) {
    dispatch(_saveEditedModulesLinks(newTasksLinks));
    dispatch(setModulesInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const setModulesInDatabase = createAsyncThunk(
  "modules/setModulesInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const modules = getState().modules;

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
