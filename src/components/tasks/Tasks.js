import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import generateSkeletons from "../../helper/skeletonHelper";
import { fetchTasks } from "../../store/slices/tasksSlice";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import DataStatus, {
  FETCHING,
  FETCH_FAILURE,
} from "../helperComponents/DataStatus";
import InitialSnackBar from "./InitialSnackBar";
import TaskCreator from "./TaskCreator";
import TaskDeleteCompleted from "./TaskDeleteCompleted";
import TaskItem from "./TaskItem";
import styles from "./Tasks.module.css";

const EMPTY_TASK_ITEM = <TaskItem self={EMPTY_TASK} />;

function Tasks() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.tasks.status);
  const tasks = useSelector(selectCurrentWeekTasks());
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const [sortBy, setSortBy] = useState("Date created (oldest)");

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  function getTaskItems() {
    const sortedTasks = (() => {
      if (sortBy === "Date created (oldest)") {
        return tasks;
      }

      if (sortBy === "Date created (newest)") {
        return tasks.reverse();
      }

      const sortFunction = mappingSortByToSortFunction[sortBy];
      return tasks.sort(sortFunction);
    })();

    const outstandingTasks = sortedTasks.filter(
      (each) => each.isCompleted[mondayKey] === undefined
    );
    const doneTasks = sortedTasks.filter(
      (each) => each.isCompleted[mondayKey] !== undefined
    );

    return (
      <>
        {outstandingTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem self={each} />
          </React.Fragment>
        ))}

        {doneTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem self={each} />
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      <InitialSnackBar />

      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Tasks</h1>
          <DataStatus status={status} />
        </div>

        <TaskDeleteCompleted />
      </div>

      <div style={{ padding: "0 0.5rem 0.5rem" }}>
        <TextField
          id="sortBy"
          select
          label="Sort by"
          value={sortBy}
          size="small"
          sx={{ width: "14rem" }}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {Object.keys(mappingSortByToSortFunction).map((each) => (
            <MenuItem key={each} value={each}>
              {each}
            </MenuItem>
          ))}
        </TextField>

        {/* TODO: filtering */}
      </div>

      <Stack
        spacing={1}
        sx={{
          marginX: "0.5rem",
          overflowY: "auto",
          marginBottom: "10rem",
          height: "calc(100% - 8.15rem)",
          "&::-webkit-scrollbar": {
            display: "none",
          } /* Chrome */,
          scrollbarWidth: "none" /* Firefox */,
        }}
      >
        {status === FETCH_FAILURE ? (
          <div className={styles["no-tasks"]}>Unable to retrieve data.</div>
        ) : status === FETCHING ? (
          generateSkeletons(5, EMPTY_TASK_ITEM)
        ) : tasks.length > 0 ? (
          getTaskItems()
        ) : (
          <div className={styles["no-tasks"]}>There are no tasks.</div>
        )}

        <div style={{ marginBottom: "4.5rem" }}></div>
      </Stack>

      <TaskCreator />
    </>
  );
}

function getEpochDueTime(task) {
  const { dueDate, dueTime } = task;

  if (dueDate === "--") {
    return 0;
  }

  const [year, month, date] = dueDate.split("-");
  const [hour, min] = dueTime.split(":");

  // need to convert `month` back to 0-index for Date constructor to work
  const epochDueTime = new Date(year, month - 1, date, hour, min).getTime();
  return epochDueTime;
}

const mappingSortByToSortFunction = {
  "Name (A - Z)": (firstTask, secondTask) => {
    const firstName = firstTask.name.toUpperCase();
    const secondName = secondTask.name.toUpperCase();

    if (firstName < secondName) {
      return -1;
    }

    if (firstName > secondName) {
      return 1;
    }

    return 0;
  },
  "Name (Z - A)": (firstTask, secondTask) => {
    const firstName = firstTask.name.toUpperCase();
    const secondName = secondTask.name.toUpperCase();

    if (firstName < secondName) {
      return 1;
    }

    if (firstName > secondName) {
      return -1;
    }

    return 0;
  },
  "Due date": (firstTask, secondTask) => {
    const firstEpochDueTime = getEpochDueTime(firstTask);
    const secondEpochDueTime = getEpochDueTime(secondTask);

    if (firstEpochDueTime < secondEpochDueTime) {
      return -1;
    }

    if (firstEpochDueTime > secondEpochDueTime) {
      return 1;
    }

    return 0;
  },
  "Module code": (firstTask, secondTask) => {
    const firstModuleCode = firstTask.moduleCode;
    const secondModuleCode = secondTask.moduleCode;

    if (firstModuleCode < secondModuleCode) {
      return -1;
    }

    if (firstModuleCode > secondModuleCode) {
      return 1;
    }

    return 0;
  },
  "Date created (newest)": 0,
  "Date created (oldest)": 0,
  "Task duration (longest)": (firstTask, secondTask) => {
    const firstTimeUnits = firstTask.timeUnits;
    const secondTimeUnits = secondTask.timeUnits;

    if (firstTimeUnits < secondTimeUnits) {
      return 1;
    }

    if (firstTimeUnits > secondTimeUnits) {
      return -1;
    }

    return 0;
  },
  "Task duration (shortest)": (firstTask, secondTask) => {
    const firstTimeUnits = firstTask.timeUnits;
    const secondTimeUnits = secondTask.timeUnits;

    if (firstTimeUnits < secondTimeUnits) {
      return -1;
    }

    if (firstTimeUnits > secondTimeUnits) {
      return 1;
    }

    return 0;
  },
};

export default Tasks;
