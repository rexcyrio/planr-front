import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { allColourNames } from "../../helper/themeHelper";

const initialState = {
  Others: "lightPink",
};

const mappingModuleCodeToColourNameSlice = createSlice({
  name: "mappingModuleCodeToColourName",
  initialState,
  reducers: {
    _setMappingModuleCodeToColourName: (state, action) => action.payload,
    _addModulesToTheme: (state, action) => {
      const mappingModuleCodeToColourName = state;
      const newModuleItems = action.payload;

      // filter out duplicated module codes
      const moduleCodes = [
        ...new Set(newModuleItems.map((each) => each.moduleCode)),
      ];

      const isColourNameUsed = Object.fromEntries(
        allColourNames.map((colourName) => [colourName, false])
      );

      for (const colourName of Object.values(mappingModuleCodeToColourName)) {
        isColourNameUsed[colourName] = true;
      }

      const unusedColourNames = [];
      for (const [colourName, isUsed] of Object.entries(isColourNameUsed)) {
        if (!isUsed) {
          unusedColourNames.push(colourName);
        }
      }

      const modules_unusedColourNames = moduleCodes.slice(
        0,
        unusedColourNames.length
      );
      const modules_randomColourNames = moduleCodes.slice(
        unusedColourNames.length
      );

      // deep copy
      const newState = { ...state };

      for (let i = 0; i < modules_unusedColourNames.length; i++) {
        const moduleCode = modules_unusedColourNames[i];
        const colour = unusedColourNames[i];
        newState[moduleCode] = colour;
      }

      for (let i = 0; i < modules_randomColourNames; i++) {
        const moduleCode = modules_randomColourNames[i];
        const randomColour =
          allColourNames[Math.floor(Math.random() * allColourNames.length)];

        newState[moduleCode] = randomColour;
      }

      // sort by module code
      return sortObjectByKey(newState);
    },
    _updateModuleColour: (state, action) => {
      const { moduleCode, newColour } = action.payload;
      state[moduleCode] = newColour;
      return state;
    },
  },
});

export const { _setMappingModuleCodeToColourName } =
  mappingModuleCodeToColourNameSlice.actions;

// private functions
const { _addModulesToTheme, _updateModuleColour } =
  mappingModuleCodeToColourNameSlice.actions;

export function addModulesToTheme(newModuleItems) {
  return async function thunk(dispatch, getState) {
    dispatch(_addModulesToTheme(newModuleItems));
    dispatch(updateMappingModuleCodeToColourNameInDatabase());
  };
}

export function updateModuleColour(moduleCode, newColour) {
  return async function thunk(dispatch, getState) {
    dispatch(
      _updateModuleColour({
        moduleCode: moduleCode,
        newColour: newColour,
      })
    );
    dispatch(updateMappingModuleCodeToColourNameInDatabase());
  };
}

// ============================================================================
// Database
// ============================================================================

const updateMappingModuleCodeToColourNameInDatabase = createAsyncThunk(
  "tasks/updateMappingModuleCodeToColourNameInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const mappingModuleCodeToColourName =
      getState().mappingModuleCodeToColourName;

    try {
      const res = await fetch("/api/private/mappingModuleCodeToColourName", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, mappingModuleCodeToColourName }),
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

// ============================================================================
// Helper functions
// ============================================================================

function sortObjectByKey(obj) {
  const keys = Object.keys(obj);
  const keysToSort = keys.filter((each) => each !== "Others");

  const sortedObject = keysToSort.sort().reduce((newObject, key) => {
    newObject[key] = obj[key];
    return newObject;
  }, {});

  // "Others" should be at the bottom
  sortedObject["Others"] = obj["Others"];

  return sortedObject;
}

export default mappingModuleCodeToColourNameSlice.reducer;
