import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    themeName: "Eighties",
    mappingModuleCodeToColourName: {
      CS1101S: "lightRed",
      CS1231S: "lightYellow",
      MA1521: "lightGreen",
      Others: "lightPink",
    },
  },
  reducers: {
    _addModulesToTheme: (state, action) => {
      const newModuleItems = action.payload;

      // filter out duplicated module codes
      const moduleCodes = [
        ...new Set(newModuleItems.map((each) => each.moduleCode)),
      ];

      const allColourNames = [
        "lightRed",
        "lightOrange",
        "lightYellow",
        "lightGreen",
        "lightCyan",
        "lightBlue",
        "lightPurple",
        "lightBrown",
        "lightPink",
      ];

      const isColourNameUsed = Object.fromEntries(
        allColourNames.map((colourName) => [colourName, false])
      );

      const { mappingModuleCodeToColourName } = state;
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
      const newState = {
        themeName: state.themeName,
        mappingModuleCodeToColourName: {
          ...state.mappingModuleCodeToColourName,
        },
      };

      for (let i = 0; i < modules_unusedColourNames.length; i++) {
        const moduleCode = modules_unusedColourNames[i];
        const colour = unusedColourNames[i];
        newState.mappingModuleCodeToColourName[moduleCode] = colour;
      }

      for (let i = 0; i < modules_randomColourNames; i++) {
        const moduleCode = modules_randomColourNames[i];
        const randomColour =
          allColourNames[Math.floor(Math.random() * allColourNames.length)];

        newState.mappingModuleCodeToColourName[moduleCode] = randomColour;
      }

      // sort `mapping` by module code
      newState.mappingModuleCodeToColourName = _sortObjectByKey(
        newState.mappingModuleCodeToColourName
      );

      return newState;
    },
    _updateModuleColour: (state, action) => {
      const { moduleCode, newColour } = action.payload;
      const { mappingModuleCodeToColourName } = state;

      // skip unnecessary updates
      if (mappingModuleCodeToColourName[moduleCode] === newColour) {
        return state;
      }

      // deep copy
      const newState = {
        themeName: state.themeName,
        mappingModuleCodeToColourName: {
          ...state.mappingModuleCodeToColourName,
        },
      };

      newState.mappingModuleCodeToColourName[moduleCode] = newColour;
      return newState;
    },
  },
});

// private functions
const { _addModulesToTheme, _updateModuleColour } = themeSlice.actions;

// private helper function
function _sortObjectByKey(obj) {
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

function addModulesToTheme(newModuleItems) {
  return async function thunk(dispatch, getState) {
    dispatch(_addModulesToTheme(newModuleItems));
    // TODO: update database
  };
}

function updateModuleColour(moduleCode, newColour) {
  return async function thunk(dispatch, getState) {
    dispatch(
      _updateModuleColour({
        moduleCode: moduleCode,
        newColour: newColour,
      })
    );
    // TODO: update database
  };
}

export { themeSlice, addModulesToTheme, updateModuleColour };
export default themeSlice.reducer;
