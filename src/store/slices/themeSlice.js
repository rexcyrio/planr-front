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
    _addModules: (state, action) => {
      // deep copy
      const newState = {
        themeName: state.themeName,
        mappingModuleCodeToColourName: {
          ...state.mappingModuleCodeToColourName,
        },
      };

      for (const [newModule, newColour] of action.payload) {
        newState.mappingModuleCodeToColourName[newModule] = newColour;
      }

      return newState;
    },
    _updateModuleColour: (state, action) => {
      // deep copy
      const newState = {
        themeName: state.themeName,
        mappingModuleCodeToColourName: {
          ...state.mappingModuleCodeToColourName,
        },
      };

      const { moduleCode, newColour } = action.payload;
      newState.mappingModuleCodeToColourName[moduleCode] = newColour;

      return newState;
    },
  },
});

// these are private functions that should only be used inside this Redux slice
const { _addModules, _updateModuleColour } = themeSlice.actions;

function addModules(newModules) {
  return async function thunk(dispatch, getState) {
    if (newModules.length === 0) {
      return;
    }

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

    const { mappingModuleCodeToColourName } = getState().theme;
    for (const colourName of Object.values(mappingModuleCodeToColourName)) {
      isColourNameUsed[colourName] = true;
    }

    const unusedColourNames = [];
    for (const [colourName, isUsed] of Object.entries(isColourNameUsed)) {
      if (!isUsed) {
        unusedColourNames.push(colourName);
      }
    }

    const modules_unusedColourNames = newModules.slice(
      0,
      unusedColourNames.length
    );
    const modules_randomColourNames = newModules.slice(
      unusedColourNames.length
    );

    const payload = [];

    for (let i = 0; i < modules_unusedColourNames.length; i++) {
      payload.push([modules_unusedColourNames[i], unusedColourNames[i]]);
    }

    for (let i = 0; i < modules_randomColourNames.length; i++) {
      const randomColour =
        allColourNames[Math.floor(Math.random() * allColourNames.length)];

      payload.push([modules_randomColourNames[i], randomColour]);
    }

    dispatch(_addModules(payload));
    // TODO: update database
  };
}

function updateModuleColour(moduleCode, newColour) {
  return async function thunk(dispatch, getState) {
    const { mappingModuleCodeToColourName } = getState().theme;

    // skip unnecessary updates
    if (mappingModuleCodeToColourName[moduleCode] === newColour) {
      return;
    }

    dispatch(
      _updateModuleColour({
        moduleCode: moduleCode,
        newColour: newColour,
      })
    );
    // TODO: update database
  };
}

export { themeSlice, addModules, updateModuleColour };
export default themeSlice.reducer;
