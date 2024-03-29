import SettingsIcon from "@mui/icons-material/Settings";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import MappingTagToColourName from "./MappingTagToColourName";
import ThemeName from "./ThemeName";
import UserTagManager from "./UserTagManager";

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

      <Dialog open={open} onClose={closeDialog} fullWidth>
        <DialogTitle>Settings</DialogTitle>

        <DialogContent sx={{ overflowX: "hidden" }}>
          <ThemeName />
          <MappingTagToColourName />
          <UserTagManager />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Settings;
