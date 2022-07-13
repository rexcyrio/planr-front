import React from "react";
import { useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import LineMarker from "../timetable/LineMarker";
import TimetableCell from "../timetable/TimetableCell";
import styles from "./Timetable.module.css";
import TimetableBackground from "./TimetableBackground";
import TimetableNavigator from "./TimetableNavigator";

function Timetable() {
  const tasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
  const matrix = useSelector((state) => state.matrix);
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const timetableColumn = useSelector((state) => state.time.timetableColumn);

  // ==========================================================================
  // Matrix Helper Functions
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

  function createTimetableCell(row, col) {
    if (getId(row, col) === "black") {
      // render black empty cell
      return (
        <TimetableCell self={EMPTY_TASK} row={row} col={col} isBlack={true} />
      );
    }

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

  return (
    <>
      <TimetableNavigator />

      <div className={styles["sticky-container"]}>
        <table className={styles["sticky-table"]}>
          <thead>
            {isCurrentWeek(mondayKey) ? (
              <tr>
                <th className={styles["cell"]}></th>
                <th
                  className={
                    timetableColumn === 0
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Monday
                </th>
                <th
                  className={
                    timetableColumn === 1
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Tuesday
                </th>
                <th
                  className={
                    timetableColumn === 2
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Wednesday
                </th>
                <th
                  className={
                    timetableColumn === 3
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Thursday
                </th>
                <th
                  className={
                    timetableColumn === 4
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Friday
                </th>
                <th className={styles["cell"]}></th>
                <th
                  className={
                    timetableColumn === 5
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Saturday
                </th>
                <th
                  className={
                    timetableColumn === 6
                      ? styles["cell-current-day"]
                      : styles["cell"]
                  }
                >
                  Sunday
                </th>
              </tr>
            ) : (
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
            )}
          </thead>
        </table>
      </div>

      <div className={styles["timetable-container"]}>
        <TimetableBackground />
        {isCurrentWeek(mondayKey) && <LineMarker />}
        
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
    </>
  );
}

function getTimePairArray() {
  const arr = [];

  let hour = 0;
  for (let i = 0; i < 24; i++) {
    const hourString = zeroPad(hour % 24, 2);
    const hourString_ = zeroPad((hour + 1) % 24, 2);

    arr.push([`${hourString}:00`, `${hourString}:30`]);
    arr.push([`${hourString}:30`, `${hourString_}:00`]);

    hour += 1;
  }

  return arr;
}

function zeroPad(num, places) {
  return String(num).padStart(places, "0");
}

export default Timetable;
