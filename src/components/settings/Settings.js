import SettingsIcon from "@mui/icons-material/Settings";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { resetState } from "../../store/slices/NUSModsURLSlice";
import ImportNUSModsTimetable from "./ImportNUSModsTimetable";
import MappingModuleCodeToColourName from "./MappingModuleCodeToColourName";
import ThemeName from "./ThemeName";

function Settings() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const openDialog = () => {
    dispatch(resetState());
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

      <Dialog open={open} onClose={closeDialog} fullWidth>
        <DialogTitle>Settings</DialogTitle>

        <DialogContent sx={{ overflowX: "hidden" }}>
          <ImportNUSModsTimetable />
          <ThemeName />
          <MappingModuleCodeToColourName />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Settings;
