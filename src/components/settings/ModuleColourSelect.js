import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { allColourNames } from "../../helper/themeHelper";
import { updateModuleColour } from "../../store/slices/mappingModuleCodeToColourNameSlice";
import ColourIcon from "./ColourIcon";

ModuleColourSelect.propTypes = {
  moduleCode: PropTypes.string.isRequired,
  colourName: PropTypes.string.isRequired,
};

function ModuleColourSelect({ moduleCode, colourName }) {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);

  return (
    <div
      style={{
        width: "14rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>{moduleCode}</div>

      <Select
        renderValue={(_) => (
          <div
            style={{
              width: "5.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>{getDisplayName(colourName)}</div>
            <ColourIcon themeName={themeName} colourName={colourName} />
          </div>
        )}
        id={`${moduleCode}_colourName`}
        value={colourName}
        onChange={(e) => {
          dispatch(updateModuleColour(moduleCode, e.target.value));
        }}
      >
        {allColourNames.map((otherColourName) => (
          <MenuItem key={otherColourName} value={otherColourName}>
            <ListItemText>{getDisplayName(otherColourName)}</ListItemText>
            <ListItemIcon>
              <ColourIcon themeName={themeName} colourName={otherColourName} />
            </ListItemIcon>
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

function getDisplayName(colourName) {
  return colourName.slice(5).toLowerCase();
}

export default React.memo(ModuleColourSelect);
