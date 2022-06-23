import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";
import { DialogContent, DialogTitle } from "@mui/material";

function Settings() {
  const [openSettings, setOpenSettings] = useState(false);

  const openDialog = () => {
    setOpenSettings(true);
  };

  const closeDialog = () => {
    setOpenSettings(false);
  };

  return (
    <>
      <Tooltip title="Settings">
        <IconButton onClick={openDialog}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Dialog open={openSettings} onClose={closeDialog}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent></DialogContent>
      </Dialog>
    </>
  );
}

export default Settings;
