const eightiesTheme = {
  red: "#e91a1f",
  lightRed: "#f2777a",
  darkRed: "#8f0e11",

  orange: "#e25608",
  lightOrange: "#f99157",
  darkOrange: "#7f3105",

  yellow: "#fa0",
  lightYellow: "#fc6",
  darkYellow: "#960",

  green: "#5a5",
  lightGreen: "#9c9",
  darkGreen: "#363",

  cyan: "#399",
  lightCyan: "#6cc",
  darkCyan: "#1a4d4d",

  blue: "#369",
  lightBlue: "#69c",
  darkBlue: "#1a334d",

  purple: "#a5a",
  lightPurple: "#c9c",
  darkPurple: "#636",

  brown: "#974b28",
  lightBrown: "#d27b53",
  darkBrown: "#472312",

  // self-created
  pink: "#ff91a4",
  lightPink: "#ffc0cb",
  darkPink: "#a93b4f",
};

const paraisoTheme = {
  red: "#cb2113",
  lightRed: "#ef6155",
  darkRed: "#6e120a",

  orange: "#a46204",
  lightOrange: "#f99b15",
  darkOrange: "#402702",

  yellow: "#af8301",
  lightYellow: "#fec418",
  darkYellow: "#4a3700",

  green: "#2b6d50",
  lightGreen: "#48b685",
  darkGreen: "#0e241a",

  cyan: "#318884",
  lightCyan: "#5bc4bf",
  darkCyan: "#163d3b",

  blue: "#046a8b",
  lightBlue: "#06b6ef",
  darkBlue: "#011e28",

  purple: "#4d3762",
  lightPurple: "#815ba4",
  darkPurple: "#1a1221",

  // self-created
  brown: "#8c3802",
  lightBrown: "#ca6220",
  darkBrown: "#3f1800",

  pink: "#cf1f74",
  lightPink: "#e96ba8",
  darkPink: "#761242",
};

export const allThemes = {
  Eighties: eightiesTheme,
  Paraiso: paraisoTheme,
};

export const allColourNames = [
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

export function getBackgroundColour(
  themeName,
  mappingModuleCodeToColourName,
  self
) {
  // check for EMPTY_TASK ==> used in <Skeleton>
  if (self._id === "0") {
    return "white";
  }

  if (self.isCompleted) {
    return "lightgrey";
  }

  const { moduleCode } = self;
  const colourName = mappingModuleCodeToColourName[moduleCode];
  const hexColour = allThemes[themeName][colourName];
  return hexColour;
}

export function getAccentColour(
  themeName,
  mappingModuleCodeToColourName,
  self
) {
  // check for EMPTY_TASK ==> used in <Skeleton>
  if (self._id === "0") {
    return "white";
  }

  if (self.isCompleted) {
    return "grey";
  }

  const { moduleCode } = self;
  const colourName = mappingModuleCodeToColourName[moduleCode];
  // "lightPink" ==> "darkPink"
  const accentColourName = "dark" + colourName.slice(5);
  const hexColour = allThemes[themeName][accentColourName];
  return hexColour;
}
