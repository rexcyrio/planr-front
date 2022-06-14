import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Scheduler.module.css";
import TaskCreator from "./TaskCreator";
import TaskItem from "./TaskItem";
import TimetableCell from "./TimetableCell";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";

function Scheduler() {
  const [matrix, setMatrix] = useState(defaultMatrix());
  const [tasks, setTasks] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { userId } = useContext(AuthContext);

  const zeroPad = (num, places) => String(num).padStart(places, "0");

  useEffect(() => {
    fetch(`/api/private/tasks?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setTasks(json.tasks);
        setInitialLoad(false);
      });
    // setTasks([
    //   {
    //     _id: "5897963",
    //     name: "assignment 3",
    //     dueDate: "2022-01-01",
    //     dueTime: "23:00",
    //     durationHours: "2",
    //     timeUnits: 4,
    //     moduleCode: "CS1231S",
    //   },
    // ]);
  }, []);

  function defaultMatrix() {
    const arr = [];
    for (let i = 0; i < 48; i++) {
      const row = ["0", "0", "0", "0", "0", "0", "0"];
      arr.push(row);
    }
    return arr;
  }

  function _setMatrix(row, col, el) {
    setMatrix((prevMatrix) => {
      const row_ = prevMatrix[row];
      const newRow = [...row_.slice(0, col), el, ...row_.slice(col + 1, 7)];
      const newMatrix = [
        ...prevMatrix.slice(0, row),
        newRow,
        ...prevMatrix.slice(row + 1, 48),
      ];

      // TODO: update database

      return newMatrix;
    });
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

  function getTaskID(row, col) {
    return matrix[row][col];
  }

  function getTaskName(row, col) {
    const taskID = getTaskID(row, col);
    const task = tasks.find((each) => each._id === taskID);
    return task.name;
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

  function createTimetableCell(row, col) {
    if (getTaskID(row, col) === "0") {
      // render empty cell

      return (
        <TimetableCell
          name=""
          row={row}
          col={col}
          rowSpan={1}
          matrix={matrix}
          scheduleTask={scheduleTask}
        />
      );
    }

    if (row > 0 && getTaskID(row - 1, col) === getTaskID(row, col)) {
      // render nothing to enable the cell the span multiple rows
      return <></>;
    }

    // render rowSpan cell
    let rowPointer = row;
    while (
      rowPointer + 1 < 48 &&
      getTaskID(row, col) === getTaskID(rowPointer + 1, col)
    ) {
      rowPointer += 1;
    }

    const rowSpan = rowPointer - row + 1;

    return (
      <TimetableCell
        name={getTaskName(row, col)}
        row={row}
        col={col}
        rowSpan={rowSpan}
        matrix={matrix}
        scheduleTask={scheduleTask}
      />
    );
  }

  function scheduleTask(task, row, col) {
    const { _id: taskID, timeUnits } = task;

    for (let i = 0; i < timeUnits; i++) {
      _setMatrix(row + i, col, taskID);
    }
  }

  // ==========================================================================
  // Tasks
  // ==========================================================================

  function addTask(newTask) {
    setUpdating(true);
    addTaskToDatabase(newTask);
    setTasks((prev) => [...prev, newTask]);
  }

  function updateTask(newTask) {
    setUpdating(true);
    setTasks((prev) => {
      const index = prev.findIndex((each) => each._id === newTask._id);
      const newTasks = [
        ...prev.slice(0, index),
        newTask,
        ...prev.slice(index + 1),
      ];
      updateTasksInDatabase(newTask);
      return newTasks;
    });
  }

  function deleteTask(task) {
    setUpdating(true);
    setTasks((prev) => {
      const newTasks = prev.filter((each) => each._id !== task._id);
      updateTasksInDatabase(newTasks);
      return newTasks;
    });
  }

  function addTaskToDatabase(task) {
    fetch("/api/private/tasks", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, task }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setUpdating(false);
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
          alert(json.error);
          return;
        }

        setUpdating(false);
      });
  }

  function generateSkeletons(num) {
    let arr = [];
    for (let i = 0; i < num; i++) {
      arr.push(
        <Skeleton
          variant="rectangular"
          animation="wave"
          height="3.375rem"
          width="calc(100% - 1rem)"
          sx={{ margin: "0.5rem" }}
        />
      );
    }
    return arr;
  }

  return (
    <>
      <div className="timetable-section">
        <div className={styles["timetable-container"]}>
          <div className={styles["sticky"]}>
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

          <table className={styles["table"]}>
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
          <h1>Tasks</h1>
          {updating ? (
            <Tooltip title="Updating Database">
              <CircularProgress
                size={24}
                sx={{
                  padding: "8px",
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="In sync with database">
              <CloudDoneIcon
                color="success"
                sx={{
                  padding: "8px",
                }}
              />
            </Tooltip>
          )}
        </div>
        {initialLoad ? (
          generateSkeletons(5)
        ) : tasks.length > 0 ? (
          tasks.map((self) => (
            <React.Fragment key={self._id}>
              <TaskItem self={self} />
            </React.Fragment>
          ))
        ) : (
          <div className={styles["no-tasks"]}>There are no tasks.</div>
        )}
        <TaskCreator
          addTask={addTask}
          updateTask={updateTask}
          deleteTask={deleteTask}
        />
      </div>
    </>
  );
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
