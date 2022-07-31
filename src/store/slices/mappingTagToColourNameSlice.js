import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { allColourNames } from "../../helper/themeHelper";
import { resetReduxStore } from "../storeHelpers/actions";
import { splitIntoVennDiagramSections } from "../storeHelpers/splitIntoVennDiagramSectionsHelper";

const initialState = {
  Others: "lightPink",
};

const mappingTagToColourNameSlice = createSlice({
  name: "mappingTagToColourName",
  initialState,
  reducers: {
    _setMappingTagToColourName: (state, action) => action.payload,
    _addTagToTheme: (state, action) => {
      const { tag, colourName } = action.payload;
      state[tag] = colourName;
      return state;
    },
    _deleteTagInTheme: (state, action) => {
      const tag = action.payload;
      delete state[tag];
      return state;
    },
    _updateTagColour: (state, action) => {
      const { tag, newColourName } = action.payload;
      state[tag] = newColourName;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { _setMappingTagToColourName } =
  mappingTagToColourNameSlice.actions;

// private functions
const { _addTagToTheme, _deleteTagInTheme, _updateTagColour } =
  mappingTagToColourNameSlice.actions;

export function updateModulesInTheme(oldModuleCodes, newModuleCodes) {
  return function thunk(dispatch, getState) {
    const old_mappingTagToColourName = getState().mappingTagToColourName;

    // ========================================================================
    // split colour mapping into "module codes" and "user tags"
    // ========================================================================

    const userTags = getState().userTags;
    const userTags_themeMapping = {};

    // deep copy
    const temp_mappingTagToColourName = { ...old_mappingTagToColourName };

    for (const tag of userTags) {
      userTags_themeMapping[tag] = temp_mappingTagToColourName[tag];

      // delete colour mapping for user tags once copied over...
      delete temp_mappingTagToColourName[tag];
    }

    // ...so that all that remains will be the colour mapping for module codes
    const moduleCodes_themeMapping = { ...temp_mappingTagToColourName };

    // ========================================================================
    // remove colour mapping for modules no longer in use
    // ========================================================================

    const [
      moduleCodes_noLongerInUse,
      moduleCodes_common, // eslint-disable-line no-unused-vars
      moduleCodes_neverSeenBefore,
    ] = splitIntoVennDiagramSections(oldModuleCodes, newModuleCodes);

    for (const moduleCode of moduleCodes_noLongerInUse) {
      delete moduleCodes_themeMapping[moduleCode];
    }

    // ========================================================================
    // find colours for the module codes that we've never seen before
    // ========================================================================

    const unusedColourNames = getUnusedColourNames({
      ...moduleCodes_themeMapping,
      ...userTags_themeMapping,
    });

    const moduleCodes_unusedColourNames = moduleCodes_neverSeenBefore.slice(
      0,
      unusedColourNames.length
    );
    const moduleCodes_randomColourNames = moduleCodes_neverSeenBefore.slice(
      unusedColourNames.length
    );

    for (let i = 0; i < moduleCodes_unusedColourNames.length; i++) {
      const moduleCode = moduleCodes_unusedColourNames[i];
      const colourName = unusedColourNames[i];
      moduleCodes_themeMapping[moduleCode] = colourName;
    }

    for (let i = 0; i < moduleCodes_randomColourNames.length; i++) {
      const moduleCode = moduleCodes_randomColourNames[i];
      const randomColourName = getRandomColourName();
      moduleCodes_themeMapping[moduleCode] = randomColourName;
    }

    // ========================================================================
    // sorting keys
    // ========================================================================

    // display module codes first followed by user tags
    // + sort module codes alphabetically
    const new_mappingTagToColourName = {
      ...sortObjectByKey(moduleCodes_themeMapping),
      ...userTags_themeMapping,
    };

    dispatch(_setMappingTagToColourName(new_mappingTagToColourName));
    dispatch(updateMappingTagToColourNameInDatabase());
  };
}

export function removeAllModulesInTheme() {
  return function thunk(dispatch, getState) {
    const mappingTagToColourName = getState().mappingTagToColourName;
    const userTags = getState().userTags;

    const new_mappingTagToColourName = {};

    // copy over theme mapping for user tags only
    for (const tag of userTags) {
      new_mappingTagToColourName[tag] = mappingTagToColourName[tag];
    }

    dispatch(_setMappingTagToColourName(new_mappingTagToColourName));
    dispatch(updateMappingTagToColourNameInDatabase());

  };
}

export function addTagToTheme(tag) {
  return function thunk(dispatch, getState) {
    const mappingTagToColourName = getState().mappingTagToColourName;
    const unusedColourNames = getUnusedColourNames(mappingTagToColourName);

    const payload = {
      tag: tag,
      colourName:
        unusedColourNames.length > 0
          ? unusedColourNames[0]
          : getRandomColourName(),
    };

    dispatch(_addTagToTheme(payload));
    dispatch(updateMappingTagToColourNameInDatabase());
  };
}

export function deleteTagInTheme(tag) {
  return function thunk(dispatch, getState) {
    dispatch(_deleteTagInTheme(tag));
    dispatch(updateMappingTagToColourNameInDatabase());
  };
}

export function updateTagColour(tag, newColourName) {
  return function thunk(dispatch, getState) {
    const payload = { tag, newColourName };

    dispatch(_updateTagColour(payload));
    dispatch(updateMappingTagToColourNameInDatabase());
  };
}

// ============================================================================
// Database
// ============================================================================

export const updateMappingTagToColourNameInDatabase = createAsyncThunk(
  "mappingTagToColourName/updateMappingTagToColourNameInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const mappingTagToColourName = getState().mappingTagToColourName;

    try {
      const res = await fetch("/api/private/mappingTagToColourName", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, mappingTagToColourName }),
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

  const sortedObject = keys.sort().reduce((newObject, key) => {
    newObject[key] = obj[key];
    return newObject;
  }, {});

  return sortedObject;
}

function getUnusedColourNames(mappingTagToColourName) {
  const isColourNameUsed = Object.fromEntries(
    allColourNames.map((colourName) => [colourName, false])
  );

  const usedColourNames = Object.values(mappingTagToColourName);
  for (const colourName of usedColourNames) {
    isColourNameUsed[colourName] = true;
  }

  const unusedColourNames = [];
  for (const [colourName, isUsed] of Object.entries(isColourNameUsed)) {
    if (!isUsed) {
      unusedColourNames.push(colourName);
    }
  }

  return unusedColourNames;
}

function getRandomColourName() {
  return allColourNames[Math.floor(Math.random() * allColourNames.length)];
}

export default mappingTagToColourNameSlice.reducer;
