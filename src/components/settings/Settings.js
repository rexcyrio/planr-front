import SettingsIcon from "@mui/icons-material/Settings";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHexColour } from "../../helper/colourHelper";
import { updateModuleColour } from "../../store/slices/themeSlice";

function Settings() {
  const [openSettings, setOpenSettings] = useState(false);
  const dispatch = useDispatch();
  const themeState = useSelector((state) => state.theme);
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.theme.mappingModuleCodeToColourName
  );

  const openDialog = () => {
    setOpenSettings(true);
  };

  const closeDialog = () => {
    setOpenSettings(false);
  };

  function createColourIcon(colourName) {
    return (
      <div
        style={{
          height: "1rem",
          width: "1rem",
          backgroundColor: getHexColour(themeState, colourName),
          borderRadius: "5px",
        }}
      ></div>
    );
  }

  function getDisplayName(colourName) {
    return colourName.slice(5).toLowerCase();
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

  return (
    <>
      <Tooltip title="Settings">
        <IconButton onClick={openDialog}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={openSettings} onClose={closeDialog}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          {Object.keys(mappingModuleCodeToColourName).map((moduleCode) => (
            <React.Fragment key={moduleCode}>
              <div
                style={{
                  width: "15rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>{moduleCode}</div>

                <Select
                  renderValue={(colourName) => (
                    <div
                      style={{
                        width: "5.65rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>{getDisplayName(colourName)}</div>
                      {createColourIcon(colourName)}
                    </div>
                  )}
                  labelId={`${moduleCode}_colourName`}
                  id={`${moduleCode}_colourName`}
                  value={mappingModuleCodeToColourName[moduleCode]}
                  onChange={(e) => {
                    dispatch(updateModuleColour(moduleCode, e.target.value));
                  }}
                >
                  {allColourNames.map((colourName) => (
                    <MenuItem
                      key={colourName}
                      value={colourName}
                      sx={{
                        width: "8.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <ListItemText>{getDisplayName(colourName)}</ListItemText>
                      <ListItemIcon>
                        {createColourIcon(colourName)}
                      </ListItemIcon>
                    </MenuItem>
                  ))}
                </Select>
              </div>
              <br />
            </React.Fragment>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Settings;
