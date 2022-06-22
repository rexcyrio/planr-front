import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import React, { useContext, useEffect, useState } from "react";
import generateSkeletons from "../../helper/skeletonHelper";
import { AuthContext } from "../../store/AuthContext";
import DataStatus from "../helperComponents/DataStatus";
import LineMarker from "./LineMarker";
import MyDragLayer from "./MyDragLayer";
import styles from "./Scheduler.module.css";
import TaskCreator from "./TaskCreator";
import TaskItem from "./TaskItem";
import TimetableCell from "./TimetableCell";

const EMPTY_TASK = {
  _id: "0",

  name: "",
  dueDate: "",
  dueTime: "",
  durationHours: "",
  moduleCode: "",

  row: -1,
  col: -1,
  timeUnits: 1,

  isCompleted: false,
};

function Scheduler() {
  const [matrix, setMatrix] = useState(defaultMatrix("0"));
  const [tasks, setTasks] = useState([]);
  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  const [dataState, setDataState] = useState("INITIAL_LOAD");
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);
  const [initialSnackbar, setInitialSnackbar] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const { userId } = useContext(AuthContext);

  const EMPTY_TASK_ITEM = (
    <TaskItem
      self={EMPTY_TASK}
      _setMatrix={_setMatrix}
      _setTask={_setTask}
      matrix={matrix}
      deleteTask={deleteTask}
      setTaskFields={setTaskFields}
    />
  );

  useEffect(() => {
    fetch(`/api/private/tasks?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setTasks(json.tasks);
        setInitialSnackbar(true);
        setDataState("IN_SYNC");
      });

    fetch(`/api/private/timetable?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setMatrix(json.timetable);
      });
  }, []);

  // ==========================================================================
  // General Helper Functions
  // ==========================================================================

  function getTaskID(row, col) {
    return matrix[row][col];
  }

  function getTaskObject(row, col) {
    const taskID = getTaskID(row, col);
    const task = tasks.find((each) => each._id === taskID);
    return task;
  }

  // ==========================================================================
  // Matrix Helper Functions
  // ==========================================================================

  function _setMatrix(values) {
    setMatrix((prevMatrix) => {
      const newMatrix = [];

      // deep copy
      for (const prevRow of prevMatrix) {
        newMatrix.push([...prevRow]);
      }

      for (const value of values) {
        const [row, col, el] = value;

        // silently ignore out of range indices
        if (row < 0 || row >= 48 || col < 0 || col >= 7) {
          continue;
        }

        // skip unnecessary updates
        if (newMatrix[row][col] === el) {
          continue;
        }

        newMatrix[row][col] = el;
      }

      updateTimetableInDatabase(newMatrix);
      return newMatrix;
    });
  }

  function createTimetableCell(row, col) {
    if (getTaskID(row, col) === "0") {
      // render empty cell

      return (
        <TimetableCell
          self={EMPTY_TASK}
          row={row}
          col={col}
          matrix={matrix}
          tasks={tasks}
          _setMatrix={_setMatrix}
          setTaskFields={setTaskFields}
        />
      );
    }

    if (row > 0 && getTaskID(row - 1, col) === getTaskID(row, col)) {
      // render nothing to enable the cell to span multiple rows
      return <></>;
    }

    // render rowSpan cell
    return (
      <TimetableCell
        self={getTaskObject(row, col)}
        row={row}
        col={col}
        matrix={matrix}
        tasks={tasks}
        _setMatrix={_setMatrix}
        setTaskFields={setTaskFields}
      />
    );
  }

  // ==========================================================================
  // Task Helper Functions
  // ==========================================================================

  function _setTask(taskID, newTask) {
    setDataState("UPDATING");

    setTasks((prev) => {
      const index = prev.findIndex((each) => each._id === taskID);
      const newTasks = [
        ...prev.slice(0, index),
        newTask,
        ...prev.slice(index + 1),
      ];

      updateTasksInDatabase(newTasks);
      return newTasks;
    });
  }

  function setTaskFields(taskID, newKeyValuePairs) {
    // cannot update fields of EMPTY_TASK
    if (taskID === "0") {
      return;
    }

    const task = tasks.find((each) => each._id === taskID);
    const newTask = {};

    for (const [key, value] of Object.entries(task)) {
      if (key in newKeyValuePairs) {
        newTask[key] = newKeyValuePairs[key];
      } else {
        newTask[key] = value;
      }
    }

    _setTask(taskID, newTask);
  }

  function addTask(newTask) {
    setDataState("UPDATING");
    setTasks((prev) => [...prev, newTask]);
    addTaskToDatabase(newTask);
  }

  function deleteTask(task) {
    const { _id: taskID, row, col, timeUnits } = task;

    // cannot delete EMPTY_TASK
    if (taskID === "0") {
      return;
    }

    setDataState("UPDATING");

    // remove from matrix
    if (row !== -1 && col !== -1) {
      const values = [];

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, "0"]);
      }

      _setMatrix(values);
    }

    // remove from tasks array
    setTasks((prev) => {
      const newTasks = prev.filter((each) => each._id !== taskID);
      updateTasksInDatabase(newTasks);
      return newTasks;
    });
  }

  function getTaskItems() {
    const outstandingTasks = tasks.filter((each) => each.isCompleted === false);
    const doneTasks = tasks.filter((each) => each.isCompleted === true);

    return (
      <>
        {outstandingTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem
              self={each}
              _setMatrix={_setMatrix}
              _setTask={_setTask}
              matrix={matrix}
              deleteTask={deleteTask}
              setTaskFields={setTaskFields}
            />
          </React.Fragment>
        ))}

        {doneTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem
              self={each}
              _setMatrix={_setMatrix}
              _setTask={_setTask}
              matrix={matrix}
              deleteTask={deleteTask}
              setTaskFields={setTaskFields}
            />
          </React.Fragment>
        ))}
      </>
    );
  }

  function addTaskToDatabase(task) {
    fetch("/api/private/tasks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, task }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setDataState("OUT_OF_SYNC");
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setDataState("IN_SYNC");
      });
  }

  function updateTasksInDatabase(tasks) {
    fetch("/api/private/tasks", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, tasks }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setDataState("OUT_OF_SYNC");
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setDataState("IN_SYNC");
      });
  }

  function updateTimetableInDatabase(newMatrix) {
    fetch("/api/private/timetable", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, timetable: newMatrix }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }
      });
  }

  const closeSnackbar = () => {
    setOpenSyncErrorSnackbar(false);
  };

  const closeInitialSnackbar = () => {
    setInitialSnackbar(false);
  };

  const deleteConfirmationHandler = () => {
    setDeleteConfirmation(true);
  };

  const deleteConfirmationAgreeHandler = () => {
    setDeleteConfirmation(false);
    const newTasks = tasks.filter((each) => each.isCompleted === false);
    const doneTasks = tasks.filter((each) => each.isCompleted === true);
    for (const task of doneTasks) {
      for (let i = 0; i < task.timeUnits; i++) {
        _setMatrix(task.row + i, task.col, "0");
      }
    }
    setTasks(newTasks);
    setDataState("UPDATING");
    updateTasksInDatabase(newTasks);
  };

  const deleteConfirmationDisagreeHandler = () => {
    setDeleteConfirmation(false);
  };

  return (
    <>
      <Snackbar
        open={initialSnackbar}
        onClose={closeInitialSnackbar}
        message={`There are ${tasks.length} tasks`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={closeInitialSnackbar}
          severity="info"
          sx={{ width: "100%" }}
        >
          There are {tasks.length} tasks
        </Alert>
      </Snackbar>
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
            <DataStatus status={dataState} />
          </div>
          {deleteConfirmation ? (
            <div className={styles["delete-confirmation-container"]}>
              <p>Are you sure?</p>
              <Button onClick={deleteConfirmationAgreeHandler}>Yes</Button>
              <Button onClick={deleteConfirmationDisagreeHandler}>
                Return
              </Button>
            </div>
          ) : (
            <Button variant="outlined" onClick={deleteConfirmationHandler}>
              DELETE COMPLETED TASKS
            </Button>
          )}
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
          {dataState === "LOAD_FAILED" ? (
            <div className={styles["no-tasks"]}>Unable to retrieve data.</div>
          ) : dataState === "INITIAL_LOAD" ? (
            generateSkeletons(5, EMPTY_TASK_ITEM)
          ) : tasks.length > 0 ? (
            getTaskItems()
          ) : (
            <div className={styles["no-tasks"]}>There are no tasks.</div>
          )}

          <div style={{ marginBottom: "4.5rem" }}></div>
        </Stack>

        <TaskCreator addTask={addTask} />
      </div>
    </>
  );
}

function defaultMatrix(val) {
  const arr = [];
  for (let i = 0; i < 48; i++) {
    const row = [val, val, val, val, val, val, val];
    arr.push(row);
  }
  return arr;
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

// ============================================================================
// unused
// ============================================================================

// const mappingDayToColumn = {
//   Monday: 0,
//   Tuesday: 1,
//   Wednesday: 2,
//   Thursday: 3,
//   Friday: 4,
//   Saturday: 5,
//   Sunday: 6,
// };

// function getRow(time24H) {
//   const [hour, min] = time24H.split(":");
//   let count = 0;

//   count += Number(hour) * 2;
//   if (min === "30") {
//     count += 1;
//   }

//   return count;
// }
