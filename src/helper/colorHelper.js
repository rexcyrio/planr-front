export default function getBackgroundColour(self) {
  if (self.isCompleted) {
    return "lightgrey";
  }

  switch (self.moduleCode) {
    case "CS1101S":
      return eightiesColourScheme["lightRed"];
    case "CS1231S":
      return eightiesColourScheme["lightYellow"];
    case "MA1521":
      return eightiesColourScheme["lightGreen"];
    default:
      return "pink";
  }
}

const eightiesColourScheme = {
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
};
