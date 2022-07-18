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
      const modules = state;
      const newModuleLinks = action.payload;

      const mappingModuleLinkIdToModuleIndex = {};

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const oldModuleLinks = module.links;

        for (const oldModuleLink of oldModuleLinks) {
          const { _id: oldModuleLinkId } = oldModuleLink;
          mappingModuleLinkIdToModuleIndex[oldModuleLinkId] = i;
        }
      }

      const allBuckets = [];
      for (let i = 0; i < modules.length; i++) {
        allBuckets.push([]);
      }

      for (const newLink of newModuleLinks) {
        if (newLink.name === "") {
          newLink.name = newLink.url;
        }

        if (
          !newLink.url.startsWith("https://") &&
          !newLink.url.startsWith("http://")
        ) {
          newLink.url = "http://" + newLink.url;
        }

        const { _id: newModuleLinkId } = newLink;
        const index = mappingModuleLinkIdToModuleIndex[newModuleLinkId];
        allBuckets[index].push(newLink);
      }

      for (let i = 0; i < allBuckets.length; i++) {
        const bucket = allBuckets[i];
        // state          => array of all module items
        // state[i]       => a particular module item
        // state[i].links => array of links associated with this particular module item
        state[i].links = bucket.filter((each) => !each._toBeDeleted);
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
