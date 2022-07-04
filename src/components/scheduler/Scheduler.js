import InfoIcon from "@mui/icons-material/Info";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import generateSkeletons from "../../helper/skeletonHelper";
import { fetchTasks } from "../../store/slices/tasksSlice";
import DataStatus from "../helperComponents/DataStatus";
import LineMarker from "./LineMarker";
import MyDragLayer from "./MyDragLayer";
import styles from "./Scheduler.module.css";
import TaskCreator from "./TaskCreator";
import TaskDeleteCompleted from "./TaskDeleteCompleted";
import TaskItem from "./TaskItem";
import TimetableCell from "./TimetableCell";

const EMPTY_TASK = {
  _id: "0",

  name: "",
  dueDate: "",
  dueTime: "",
  durationHours: "",
  moduleCode: "",
  links: [],

  row: -1,
  col: -1,
  timeUnits: 1,

  isCompleted: false,
};

const EMPTY_TASK_ITEM = <TaskItem self={EMPTY_TASK} />;

function Scheduler() {
  const status = useSelector((state) => state.tasks.status);
  const tasks = useSelector((state) => state.tasks.data);
  const matrix = useSelector((state) => state.matrix);
  const modules = useSelector((state) => state.modules);
  const dispatch = useDispatch();

  //const [modules, setModules] = useState([]);
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);


  useEffect(() => {
    dispatch(fetchTasks());
  }, []);

  // ==========================================================================
  // General Helper Functions
  // ==========================================================================

  function getId(row, col) {
    return matrix[row][col];
  }

  function getSelf(row, col) {
    const id = getId(row, col);

    if (id.slice(0, 2) === "__") {
      // is module
      return modules.find((each) => each._id === id);
    } else {
      // is task
      return tasks.find((each) => each._id === id);
    }
  }

  // ==========================================================================
  // Matrix Helper Functions
  // ==========================================================================

  function createTimetableCell(row, col) {
    if (getId(row, col) === "0") {
      // render empty cell
      return <TimetableCell self={EMPTY_TASK} row={row} col={col} />;
    }

    if (row > 0 && getId(row - 1, col) === getId(row, col)) {
      // render nothing to enable the cell to span multiple rows
      return <></>;
    }

    // render rowSpan cell
    return <TimetableCell self={getSelf(row, col)} row={row} col={col} />;
  }

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
      <MyDragLayer />
      <div className="timetable-section">
        <div className={styles["sticky-container"]}>
          <table className={styles["sticky-table"]}>
            <thead>
              <tr>
                <th className={styles["cell"]}></th>
                <th className={styles["cell"]}>Monday</th>
                <th className={styles["cell"]}>Tuesday</th>
                <th className={styles["cell"]}>Wednesday</th>
                <th className={styles["cell"]}>Thursday</th>
                <th className={styles["cell"]}>Friday</th>
                <th className={styles["cell"]}></th>
                <th className={styles["cell"]}>Saturday</th>
                <th className={styles["cell"]}>Sunday</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className={styles["timetable-container"]}>
          <LineMarker />
          <table className={styles["timetable-table"]}>
            <tbody>
              {getTimePairArray().map((timePair, index) => {
                const [time24H, time24H_] = timePair;
                const row = index;

                return (
                  <tr key={time24H}>
                    <td className={styles["cell"]}>
                      {time24H} - {time24H_}
                    </td>

                    {[0, 1, 2, 3, 4].map((col) => (
                      <React.Fragment key={`(${row}, ${col})`}>
                        {createTimetableCell(row, col)}
                      </React.Fragment>
                    ))}

                    <td className={styles["cell"]}>
                      {time24H} - {time24H_}
                    </td>

                    {[5, 6].map((col) => (
                      <React.Fragment key={`(${row}, ${col})`}>
                        {createTimetableCell(row, col)}
                      </React.Fragment>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Tasks */}
      {/* ================================================================= */}

      <div className="tasks-section">
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
      </div>
    </>
  );
}

function getTimePairArray() {
  const arr = [];
  let time = "00:00";

  for (let i = 0; i < 48; i++) {
    const time_ = get30MinLater(time);
    arr.push([time, time_]);
    time = time_;
  }

  return arr;
}

function get30MinLater(time24H) {
  const [hour, min] = time24H.split(":");

  if (min === "00") {
    return `${hour}:30`;
  } else if (min === "30") {
    return `${zeroPad((Number(hour) + 1) % 24, 2)}:00`;
  } else {
    throw Error("incorrect time format");
  }
}

function zeroPad(num, places) {
  return String(num).padStart(places, "0");
}

export default Scheduler;
