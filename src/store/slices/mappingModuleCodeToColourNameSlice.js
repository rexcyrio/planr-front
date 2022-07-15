import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { allColourNames } from "../../helper/themeHelper";
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = {
  Others: "lightPink",
};

const mappingModuleCodeToColourNameSlice = createSlice({
  name: "mappingModuleCodeToColourName",
  initialState,
  reducers: {
    _setMappingModuleCodeToColourName: (state, action) => action.payload,
    _updateModuleColour: (state, action) => {
      const { moduleCode, newColour } = action.payload;
      state[moduleCode] = newColour;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { _setMappingModuleCodeToColourName } =
  mappingModuleCodeToColourNameSlice.actions;

// private functions
const { _updateModuleColour } = mappingModuleCodeToColourNameSlice.actions;

export function setModulesInTheme(newModuleItems) {
  return function thunk(dispatch, getState) {
    const old_mappingModuleCodeToColourName =
      getState().mappingModuleCodeToColourName;
    const new_mappingModuleCodeToColourName = {};

    // filter out duplicated module codes
    const moduleCodes = [
      ...new Set(newModuleItems.map((each) => each.moduleCode)),
    ];

    // retain colour mapping for "Others"
    new_mappingModuleCodeToColourName["Others"] =
      old_mappingModuleCodeToColourName["Others"];

    // retain colour mapping for old modules
    for (const moduleCode of moduleCodes) {
      if (moduleCode in old_mappingModuleCodeToColourName) {
        new_mappingModuleCodeToColourName[moduleCode] =
          old_mappingModuleCodeToColourName[moduleCode];
      }
    }

    const isColourNameUsed = Object.fromEntries(
      allColourNames.map((colourName) => [colourName, false])
    );

    const usedColourNames = Object.values(new_mappingModuleCodeToColourName);
    for (const colourName of usedColourNames) {
      isColourNameUsed[colourName] = true;
    }

    const unusedColourNames = [];
    for (const [colourName, isUsed] of Object.entries(isColourNameUsed)) {
      if (!isUsed) {
        unusedColourNames.push(colourName);
      }
    }

    const newModuleCodes = moduleCodes.filter(
      (each) => !(each in new_mappingModuleCodeToColourName)
    );

    const modules_unusedColourNames = newModuleCodes.slice(
      0,
      unusedColourNames.length
    );
    const modules_randomColourNames = newModuleCodes.slice(
      unusedColourNames.length
    );

    for (let i = 0; i < modules_unusedColourNames.length; i++) {
      const moduleCode = modules_unusedColourNames[i];
      const colour = unusedColourNames[i];
      new_mappingModuleCodeToColourName[moduleCode] = colour;
    }

    for (let i = 0; i < modules_randomColourNames; i++) {
      const moduleCode = modules_randomColourNames[i];
      const randomColour =
        allColourNames[Math.floor(Math.random() * allColourNames.length)];

      new_mappingModuleCodeToColourName[moduleCode] = randomColour;
    }

    // sort by module code
    dispatch(
      _setMappingModuleCodeToColourName(
        sortObjectByKey(new_mappingModuleCodeToColourName)
      )
    );

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
  "mappingModuleCodeToColourName/updateMappingModuleCodeToColourNameInDatabase",
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
