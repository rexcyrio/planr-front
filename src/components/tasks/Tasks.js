import InfoIcon from "@mui/icons-material/Info";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import generateSkeletons from "../../helper/skeletonHelper";
import { fetchTasks } from "../../store/slices/tasksSlice";
import DataStatus from "../helperComponents/DataStatus";
import styles from "./Tasks.module.css";
import TaskCreator from "./TaskCreator";
import TaskDeleteCompleted from "./TaskDeleteCompleted";
import TaskItem from "./TaskItem";

const EMPTY_TASK_ITEM = <TaskItem self={EMPTY_TASK} />;

function Tasks() {
  const status = useSelector((state) => state.tasks.status);
  const tasks = useSelector((state) => state.tasks.data);
  const dispatch = useDispatch();

  //const [modules, setModules] = useState([]);
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  // ==========================================================================
  // Task Helper Functions
  // ==========================================================================

  function getTaskItems() {
    const outstandingTasks = tasks.filter((each) => each.isCompleted === false);
    const doneTasks = tasks.filter((each) => each.isCompleted === true);

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

  // ==========================================================================
  // Miscellaneous
  // ==========================================================================

  const closeSnackbar = () => {
    setOpenSyncErrorSnackbar(false);
  };

  return (
    <>
      {/* {isLoaded && <InitialSnackBar />} */}
      <Snackbar
        open={openSyncErrorSnackbar}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert onClose={closeSnackbar} severity="error" sx={{ width: "100%" }}>
          Something went wrong! Your notes might not be saved
        </Alert>
      </Snackbar>

      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Tasks</h1>
          <DataStatus status={status} />
          <Tooltip title="Drag tasks using the drag icon to schedule them onto the timetable">
            <InfoIcon color="info" />
          </Tooltip>
        </div>

        <TaskDeleteCompleted />
      </div>

      <Stack
        spacing={1}
        sx={{
          marginX: "0.5rem",
          overflowY: "auto",
          marginBottom: "10rem",
          height: "calc(100% - 5.1rem)",
          "&::-webkit-scrollbar": {
            display: "none",
          } /* Chrome */,
          scrollbarWidth: "none" /* Firefox */,
        }}
      >
        {status === "LOAD_FAILED" ? (
          <div className={styles["no-tasks"]}>Unable to retrieve data.</div>
        ) : status === "INITIAL_LOAD" ? (
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

export default Tasks;
