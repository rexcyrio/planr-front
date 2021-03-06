import InsightsIcon from "@mui/icons-material/Insights";
import { Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import getWeekRange from "../../helper/getWeekRangeHelper";
import StatsContent from "./StatsContent";

function Statistics() {
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const [open, setOpen] = useState(false);

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };
  return (
    <>
      <Tooltip title="Statistics">
        <IconButton onClick={openDialog}>
          <InsightsIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <div>Statistics</div>
          <div>{"Reference week: " + getWeekRange(mondayKey)}</div>
        </DialogTitle>

        <DialogContent>
          <StatsContent />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Statistics;
