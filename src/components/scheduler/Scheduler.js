import InfoIcon from "@mui/icons-material/Info";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import generateSkeletons from "../../helper/skeletonHelper";
import { addTask, setTasks } from "../../store/slices/tasksSlice";
import { addModules } from "../../store/slices/themeSlice";
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
  links: [],

  row: -1,
  col: -1,
  timeUnits: 1,

  isCompleted: false,
};

function Scheduler() {
  const { userId } = useSelector((state) => state.user);
  const tasks = useSelector((state) => state.tasks);
  const dispatch = useDispatch();

  const [matrix, setMatrix] = useState(defaultMatrix("0"));
  const [modules, setModules] = useState([]);
  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  const [dataState, setDataState] = useState("INITIAL_LOAD");
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);
  const [initialSnackbar, setInitialSnackbar] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

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
    async function getItemFromDatabase(type) {
      return new Promise((resolve, reject) => {
        fetch(`/api/private/${type}?id=${userId}`)
          .then((res) => res.json())
          .then((json) => resolve(json[type]));
      });
    }

    (async function init() {
      // wait for both fetch() calls to finish before continuing
      const items = await Promise.all([
        getItemFromDatabase("tasks"),
        getItemFromDatabase("timetable"),
      ]);

      const [databaseTasks, databaseTimetable] = items;

      dispatch(setTasks(databaseTasks));
      setInitialSnackbar(true);
      setDataState("IN_SYNC");
      // setMatrix(databaseTimetable);

      console.log("databaseTimetable");
      console.log(databaseTimetable);

      await getNUSModsTimetable(
        "https://nusmods.com/timetable/sem-1/share?CM1102=LEC:1,TUT:1&CS2101=&CS2103T=LEC:G15&CS2105=TUT:13,LEC:1V&ES2660=SEC:G03"
      );
    })();
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

  function isModuleLesson(row, col) {
    return matrix[row][col].slice(0, 2) === "__";
  }

  function getModuleObject(row, col) {
    const moduleID = matrix[row][col];
    const module = modules.find((each) => each._id === moduleID);
    if (module === undefined) {
      throw Error();
    }
    return module;
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
          _setMatrix={_setMatrix}
          _setTask={_setTask}
          setTaskFields={setTaskFields}
          deleteTask={deleteTask}
        />
      );
    }

    if (row > 0 && getTaskID(row - 1, col) === getTaskID(row, col)) {
      // render nothing to enable the cell to span multiple rows
      return <></>;
    }

    if (isModuleLesson(row, col)) {
      return (
        <TimetableCell
          self={getModuleObject(row, col)}
          row={row}
          col={col}
          matrix={matrix}
          _setMatrix={_setMatrix}
          _setTask={_setTask}
          setTaskFields={setTaskFields}
          deleteTask={deleteTask}
        />
      );
    }

    // render rowSpan cell
    return (
      <TimetableCell
        self={getTaskObject(row, col)}
        row={row}
        col={col}
        matrix={matrix}
        _setMatrix={_setMatrix}
        _setTask={_setTask}
        setTaskFields={setTaskFields}
        deleteTask={deleteTask}
      />
    );
  }

  // ==========================================================================
  // Task Helper Functions
  // ==========================================================================

  function _setTask(taskID, newTask) {
    setDataState("UPDATING");

    const index = tasks.findIndex((each) => each._id === taskID);
    const newTasks = [
      ...tasks.slice(0, index),
      newTask,
      ...tasks.slice(index + 1),
    ];

    dispatch(setTasks(newTasks));
    updateTasksInDatabase(newTasks);
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

  function _addTask(newTask) {
    setDataState("UPDATING");
    dispatch(addTask(newTask));
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
    const newTasks = tasks.filter((each) => each._id !== taskID);
    dispatch(setTasks(newTasks));
    updateTasksInDatabase(newTasks);
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

  // ==========================================================================
  // Modules
  // ==========================================================================

  async function getNUSModsTimetable(NUSModsURL) {
    const details = parseNUSModsURL(NUSModsURL);
    const NUSMods_moduleCodes = Object.keys(details);
    const semester = Number(NUSModsURL.split("/")[4].slice(-1));

    // hard code 15 June as the split between the previous academic year and
    // the new academic year
    const splitDate = new Date();
    // dates are 1-indexed
    splitDate.setDate(15);
    // months are 0-indexed
    splitDate.setMonth(5);

    const isPreviousAcademicYear = new Date() < splitDate;
    const year = Number(new Date().getFullYear());

    const academicYear = isPreviousAcademicYear
      ? `${year - 1}-${year}`
      : `${year}-${year + 1}`;

    dispatch(addModules(NUSMods_moduleCodes));

    const promises = NUSMods_moduleCodes.map((NUSMods_moduleCode) => {
      return new Promise((resolve, reject) => {
        const lessonType_classCode_pairs = details[NUSMods_moduleCode];

        // check whether this module has lessons
        if (isEmpty(lessonType_classCode_pairs)) {
          resolve();
          return;
        }

        // fetch module information from NUSMods API
        fetch(
          `https://api.nusmods.com/v2/${academicYear}/modules/${NUSMods_moduleCode}.json`
        )
          .then((res) => res.json())
          .then((json) => {
            // getting correct semester data
            const semesterData = json.semesterData.find(
              (each) => each.semester === semester
            );

            // getting correct timetable data
            const timetableData = semesterData.timetable;

            // lessonTypes refer to "Lecture", "Tutorial", "Laboratory", "Sectional Teaching", etc.
            const lessonTypes = Object.keys(lessonType_classCode_pairs);

            for (const lessonType of lessonTypes) {
              const classNo = details[NUSMods_moduleCode][lessonType];
              const lessons = timetableData.filter(
                (each) =>
                  each.lessonType === lessonType && each.classNo === classNo
              );

              for (const lesson of lessons) {
                const startHour = lesson.startTime.slice(0, 2);
                const startMin = lesson.startTime.slice(2);

                const endHour = lesson.endTime.slice(0, 2);
                const endMin = lesson.endTime.slice(2);

                const durationHours = getDurationHours(
                  startHour,
                  startMin,
                  endHour,
                  endMin
                ).toString();

                const newModule = {
                  _id: `__${NUSMods_moduleCode}_${uuidv4()}`,

                  name: `${NUSMods_moduleCode} ${lessonType}`,
                  dueDate: "--",
                  dueTime: "--",
                  durationHours: durationHours,
                  moduleCode: NUSMods_moduleCode,
                  links: [],

                  row: getRow(startHour, startMin),
                  col: mappingDayToColumn[lesson.day],
                  timeUnits: Math.ceil(Number(durationHours) * 2),

                  isCompleted: false,
                };

                const { row, col, _id } = newModule;
                const values = [];

                for (let i = 0; i < newModule.timeUnits; i++) {
                  values.push([row + i, col, _id]);
                }

                setModules((prev) => [...prev, newModule]);
                _setMatrix(values);
              }
            }

            resolve();
            return;
          });
      });
    });

    await Promise.all(promises);
    console.log("===== all done =====");
  }

  // ==========================================================================
  // Miscellaneous
  // ==========================================================================

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
    let values = [];
    for (const task of doneTasks) {
      for (let i = 0; i < task.timeUnits; i++) {
        values.push([task.row + i, task.col, "0"]);
      }
    }
    _setMatrix(values);
    dispatch(setTasks(newTasks));
    setDataState("UPDATING");
    updateTasksInDatabase(newTasks);
  };

  const deleteConfirmationDisagreeHandler = () => {
    setDeleteConfirmation(false);
  };

  const numberOfOutstandingTasks = tasks.filter(
    (task) => task.isCompleted === false
  ).length;

  return (
    <>
      <Snackbar
        open={initialSnackbar}
        onClose={closeInitialSnackbar}
        message={`There are ${tasks.length} tasks`}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ backgroundColor: "rgb(0, 0, 0, 0)" }}
      >
        <Alert
          onClose={closeInitialSnackbar}
          severity="info"
          sx={{ width: "100%" }}
        >
          {`There ${
            numberOfOutstandingTasks === 0
              ? "is no"
              : numberOfOutstandingTasks === 1
              ? "is 1"
              : `are ${numberOfOutstandingTasks}`
          } outstanding ${numberOfOutstandingTasks > 1 ? "tasks" : "task"}`}
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
            <Tooltip title="Drag tasks using the drag icon to schedule them onto the timetable">
              <InfoIcon color="info" />
            </Tooltip>
          </div>
          {deleteConfirmation ? (
            <div className={styles["delete-confirmation-container"]}>
              <p>Are you sure?</p>
              <Button onClick={deleteConfirmationAgreeHandler}>Yes</Button>
              <Button onClick={deleteConfirmationDisagreeHandler}>
                CANCEL
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

        <TaskCreator addTask={_addTask} />
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

const mappingLessonType = {
  LEC: "Lecture",
  TUT: "Tutorial",
  LAB: "Laboratory",
  SEC: "Sectional Teaching",
};

const mappingDayToColumn = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function parseNUSModsURL(NUSModsURL) {
  const url = new URL(NUSModsURL);
  const queryString = url.search;
  // `slice(1)` is to remove the "?" at the beginning
  const keyValueSegments = queryString.slice(1).split("&");
  const keyValuePairs = keyValueSegments.map((each) => each.split("="));
  const result = {};

  for (const [key, value] of keyValuePairs) {
    result[key] = convertStringToObject(value);
  }

  return result;
}

function convertStringToObject(str) {
  if (!str) {
    return {};
  }

  const properties = str.split(",");
  const obj = {};

  for (const property of properties) {
    const [key, value] = property.split(":");
    const lessonType = mappingLessonType[key];
    obj[lessonType] = value;
  }

  return obj;
}

function getDurationHours(startHour, startMin, endHour, endMin) {
  if (startMin === endMin) {
    return Number(endHour) - Number(startHour);
  } else if (startMin === "00" && endMin === "30") {
    return Number(endHour) - Number(startHour) + 0.5;
  } else if (startMin === "30" && endMin === "00") {
    return Number(endHour) - Number(startHour) - 0.5;
  }
}

function getRow(hour, min) {
  let count = 0;

  count += Number(hour) * 2;
  if (min === "30") {
    count += 1;
  }

  return count;
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

export default Scheduler;
