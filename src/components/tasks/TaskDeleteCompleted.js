import RemoveDoneIcon from "@mui/icons-material/RemoveDone";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteCompletedTasks } from "../../store/slices/tasksSlice";

function TaskDeleteCompleted() {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function clickOnDelete() {
    dispatch(deleteCompletedTasks());
    handleClose();
  }

  return (
    <>
      <Tooltip title="Delete completed tasks for this week">
        <IconButton onClick={handleOpen}>
          <RemoveDoneIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete completed tasks for this week?</DialogTitle>

        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={clickOnDelete} sx={{ color: "red" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(TaskDeleteCompleted);
