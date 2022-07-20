import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { allColourNames } from "../../helper/themeHelper";
import { updateModuleColour } from "../../store/slices/mappingModuleCodeToColourNameSlice";
import { selectModuleCodes } from "../../store/storeHelpers/selectors";
import ColourIcon from "./ColourIcon";

function MappingModuleCodeToColourName() {
  const moduleCodes = useSelector((state) => selectModuleCodes(state));

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "1rem",
        }}
      >
        <div>
          {getHalfOfArray(moduleCodes, 0).map((moduleCode, index) => (
            <React.Fragment key={moduleCode}>
              {index !== 0 && <br />}
              <ModuleColourSelect moduleCode={moduleCode} />
            </React.Fragment>
          ))}
        </div>
        <div>
          {getHalfOfArray(moduleCodes, 1).map((moduleCode, index) => (
            <React.Fragment key={moduleCode}>
              {index !== 0 && <br />}
              <ModuleColourSelect moduleCode={moduleCode} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}

ModuleColourSelect.propTypes = {
  moduleCode: PropTypes.string.isRequired,
};

function ModuleColourSelect({ moduleCode }) {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.mappingModuleCodeToColourName
  );

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
        renderValue={(colourName) => (
          <SelectRenderValue themeName={themeName} colourName={colourName} />
        )}
        id={`${moduleCode}_colourName`}
        value={mappingModuleCodeToColourName[moduleCode]}
        onChange={(e) => {
          dispatch(updateModuleColour(moduleCode, e.target.value));
        }}
      >
        {allColourNames.map((colourName) => (
          <MenuItem key={colourName} value={colourName}>
            <ListItemText>{getDisplayName(colourName)}</ListItemText>
            <ListItemIcon>
              <ColourIcon themeName={themeName} colourName={colourName} />
            </ListItemIcon>
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

SelectRenderValue.propTypes = {
  themeName: PropTypes.string.isRequired,
  colourName: PropTypes.string.isRequired,
};

function SelectRenderValue({ themeName, colourName }) {
  return (
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
  );
}

// ============================================================================
// Helper functions
// ============================================================================

function getDisplayName(colourName) {
  return colourName.slice(5).toLowerCase();
}

function getHalfOfArray(array, segment) {
  if (segment === 0) {
    return array.slice(0, Math.ceil(array.length / 2));
  } else if (segment === 1) {
    return array.slice(Math.ceil(array.length / 2));
  }
}

export default MappingModuleCodeToColourName;
