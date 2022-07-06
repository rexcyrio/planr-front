import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FETCH_SUCCESS } from "../helperComponents/DataStatus";

function InitialSnackBar() {
  const tasks = useSelector((state) => state.tasks.data);
  const status = useSelector((state) => state.tasks.status);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === FETCH_SUCCESS) {
      setOpen(true);
    }
  }, [status]);

  function handleClose() {
    setOpen(false);
  }

  function getText() {
    const numberOfOutstandingTasks = tasks.filter(
      (each) => !each.isCompleted
    ).length;

    if (numberOfOutstandingTasks === 0) {
      return "There is no outstanding tasks";
    } else if (numberOfOutstandingTasks === 1) {
      return "There is 1 outstanding task";
    } else {
      return `There are ${numberOfOutstandingTasks} outstanding tasks`;
    }
  }

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ backgroundColor: "rgb(0, 0, 0, 0)" }}
    >
      <Alert onClose={handleClose} severity="info" sx={{ width: "100%" }}>
        {getText()}
      </Alert>
    </Snackbar>
  );
}

export default InitialSnackBar;
