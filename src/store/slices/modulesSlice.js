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
      const { moduleId, links } = action.payload;

      for (const module of modules) {
        if (module._id === moduleId) {
          module.links = links;
          return state;
        }
      }
    },
    _saveEditedModulesLinks: (state, action) => {
      const modules = state;
      const allNewLinks = action.payload;

      const mappingOldLinkIdToModulesIndex = {};

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i];
        const oldLinks = module.links;

        for (const oldLink of oldLinks) {
          mappingOldLinkIdToModulesIndex[oldLink._id] = i;
        }
      }

      const allBuckets = [];
      for (let i = 0; i < modules.length; i++) {
        allBuckets.push([]);
      }

      for (const newLink of allNewLinks) {
        if (newLink.name === "") {
          newLink.name = newLink.url;
        }

        if (
          !newLink.url.startsWith("https://") &&
          !newLink.url.startsWith("http://")
        ) {
          newLink.url = "http://" + newLink.url;
        }

        const index = mappingOldLinkIdToModulesIndex[newLink._id];
        allBuckets[index].push(newLink);
      }

      for (let i = 0; i < allBuckets.length; i++) {
        const bucket = allBuckets[i];
        const mappingNewLinkIdToNewLink = {};

        for (const newLink of bucket) {
          mappingNewLinkIdToNewLink[newLink._id] = newLink;
        }

        // state          => array of all module items
        // state[i]       => a particular module item
        // state[i].links => array of links associated with this particular module item

        const oldModuleLinks = state[i].links;
        const newModuleLinks = [];

        for (const oldModuleLink of oldModuleLinks) {
          if (!(oldModuleLink._id in mappingNewLinkIdToNewLink)) {
            // the user could not have edited this task link at all
            // just copy it over to `newModuleLinks`
            newModuleLinks.push(oldModuleLink);
            continue;
          }

          const newModuleLink = mappingNewLinkIdToNewLink[oldModuleLink._id];

          if (newModuleLink._toBeDeleted) {
            // skip this task link
            continue;
          }

          newModuleLinks.push(newModuleLink);
        }

        // state          => array of all module items
        // state[i]       => a particular module item
        // state[i].links => array of links associated with this particular module item
        state[i].links = newModuleLinks;
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

export function addModuleLinks(moduleId, links) {
  return function thunk(dispatch, getState) {
    const payload = { moduleId, links };
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
