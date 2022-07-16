import Stack from "@mui/material/Stack";
import React, { useEffect } from "react";
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

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  function getTaskItems() {
    const outstandingTasks = tasks.filter(
      (each) => each.isCompleted[mondayKey] === undefined
    );
    const doneTasks = tasks.filter(
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

export default Tasks;
