import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsInitialSnackBarOpen } from "../../store/slices/isInitialSnackBarOpenSlice";

function InitialSnackBar() {
  const dispatch = useDispatch();
  const tasks = useSelector((state) => state.tasks.data);
  const isNewUser = useSelector((state) => state.isNewUser);
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const isInitialSnackBarOpen = useSelector(
    (state) => state.isInitialSnackBarOpen
  );
  const [open, setOpen] = useState(false);

  const [color, setColor] = useState("");
  const [numTasks, setNumTasks] = useState(0);

  const init = useCallback(() => {
    const mappingTaskEpochDueTimeToCount = {};

    for (const task of tasks) {
      const { dueDate, dueTime, isCompleted } = task;

      if (isCompleted[mondayKey] !== undefined) {
        continue;
      }

      const [year, month, date] = dueDate.split("-");
      const [hour, min] = dueTime.split(":");

      // need to convert `month` back to 0-index for Date constructor to work
      const epochDueTime = new Date(year, month - 1, date, hour, min).getTime();

      if (epochDueTime in mappingTaskEpochDueTimeToCount) {
        mappingTaskEpochDueTimeToCount[epochDueTime] += 1;
      } else {
        mappingTaskEpochDueTimeToCount[epochDueTime] = 1;
      }
    }

    const epochTimeNow = Date.now();
    const dateNow = new Date();

    // if today is Monday, this Date object would be Thursday 0000H so as to
    // encompass tasks that are due on Wednesday 2359H
    const epochTime2DaysLater = new Date(
      dateNow.getFullYear(),
      dateNow.getMonth(),
      dateNow.getDate() + 3
    ).getTime();

    let overdueTasksCount = 0;
    let due2DaysLaterCount = 0;
    let dueMuchLaterCount = 0;

    for (const [epochDueTime, count] of Object.entries(
      mappingTaskEpochDueTimeToCount
    )) {
      if (epochDueTime < epochTimeNow) {
        overdueTasksCount += count;
      } else if (epochDueTime < epochTime2DaysLater) {
        due2DaysLaterCount += count;
      } else {
        dueMuchLaterCount += count;
      }
    }

    if (overdueTasksCount > 0) {
      setColor("error");
      setNumTasks(overdueTasksCount);
    } else if (due2DaysLaterCount > 0) {
      setColor("warning");
      setNumTasks(due2DaysLaterCount);
    } else {
      setColor("info");
      setNumTasks(dueMuchLaterCount);
    }
  }, [mondayKey, tasks]);

  useEffect(() => {
    if (isInitialSnackBarOpen === true && !isNewUser) {
      init();
      setOpen(true);
    }
  }, [isInitialSnackBarOpen, isNewUser, init]);

  function handleClose() {
    dispatch(setIsInitialSnackBarOpen(false));
    setOpen(false);
  }

  function getText() {
    if (color === "error") {
      if (numTasks === 1) {
        return `There is 1 overdue task`;
      } else {
        return `There are ${numTasks} overdue tasks`;
      }
    } else if (color === "warning") {
      if (numTasks === 1) {
        return `There is 1 task due soon`;
      } else {
        return `There are ${numTasks} tasks due soon`;
      }
    } else if (color === "info") {
      if (numTasks === 0) {
        return "There is no outstanding tasks";
      } else if (numTasks === 1) {
        return "There is 1 outstanding task";
      } else {
        return `There are ${numTasks} outstanding tasks`;
      }
    } else {
      return "";
    }
  }

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{ backgroundColor: "rgb(0, 0, 0, 0)" }}
    >
      <Alert onClose={handleClose} severity="info" color={color}>
        {getText()}
      </Alert>
    </Snackbar>
  );
}

export default React.memo(InitialSnackBar);
