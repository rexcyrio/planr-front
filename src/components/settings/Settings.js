import DoneIcon from "@mui/icons-material/Done";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getHexColour } from "../../helper/colourHelper";
import { importNUSModsTimetable } from "../../store/slices/NUSModsURLSlice";
import { updateModuleColour } from "../../store/slices/themeSlice";

function Settings() {
  const [open, setOpen] = useState(false);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Settings">
        <IconButton onClick={openDialog}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>Settings</DialogTitle>

        <DialogContent sx={{ overflowX: "hidden" }}>
          <NUSModsURLSection />
          <ModuleColourSection />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function NUSModsURLSection() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.NUSModsURL.status);
  const [NUSModsURL, setNUSModsURL] = useState(
    useSelector((state) => state.NUSModsURL.url)
  );

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(importNUSModsTimetable(NUSModsURL));
  }

  return (
    <>
      <h4>NUSMods URL</h4>
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          id="NUSModsURL"
          type="url"
          variant="outlined"
          value={NUSModsURL}
          fullWidth
          required
          onChange={(e) => setNUSModsURL(e.target.value)}
          placeholder="e.g. https://nusmods.com/timetable/sem-1/share?..."
        />
        <br />
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button type="submit" variant="contained" sx={{ m: "1rem 0" }}>
            Import Timetable
          </Button>
          {mappingStatusToIcon[status]}
        </div>
      </Box>
    </>
  );
}

function ModuleColourSection() {
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.theme.mappingModuleCodeToColourName
  );

  return (
    <>
      <h4>Theme</h4>
      <div
        style={{
          width: "33rem",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          {getHalfOfArray(Object.keys(mappingModuleCodeToColourName), 0).map(
            (moduleCode, index) => (
              <React.Fragment key={moduleCode}>
                {index !== 0 && <br />}
                <ModuleColourSelect moduleCode={moduleCode} />
              </React.Fragment>
            )
          )}
        </div>
        <div>
          {getHalfOfArray(Object.keys(mappingModuleCodeToColourName), 1).map(
            (moduleCode, index) => (
              <React.Fragment key={moduleCode}>
                {index !== 0 && <br />}
                <ModuleColourSelect moduleCode={moduleCode} />
              </React.Fragment>
            )
          )}
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
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.theme.mappingModuleCodeToColourName
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
          <div
            style={{
              width: "5.65rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>{getDisplayName(colourName)}</div>
            <ColourIcon colourName={colourName} />
          </div>
        )}
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
              <ColourIcon colourName={colourName} />
            </ListItemIcon>
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

ColourIcon.propTypes = {
  colourName: PropTypes.string.isRequired,
};

function ColourIcon({ colourName }) {
  const themeState = useSelector((state) => state.theme);

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

const mappingStatusToIcon = {
  NONE: <></>,
  LOADING: <CircularProgress sx={{ ml: "1rem" }} size="1.5rem" />,
  DONE: <DoneIcon sx={{ ml: "1rem", color: "grey" }} />,
};

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

export default Settings;
