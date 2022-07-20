import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import TimetableCell from "../timetable/TimetableCell";
import styles from "./Timetable.module.css";

function Timetable() {
  const tasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
  const matrix = useSelector((state) => state.matrix);

  // ==========================================================================
  // Matrix Helper Functions
  // ==========================================================================

  const getId = useCallback((row, col) => matrix[row][col], [matrix]);

  const getSelf = useCallback(
    (row, col) => {
      const id = getId(row, col);

      if (id.slice(0, 2) === "__") {
        // is module
        return modules.find((each) => each._id === id);
      } else {
        // is task
        return tasks.find((each) => each._id === id);
      }
    },
    [getId, modules, tasks]
  );

  const createTimetableCell = useCallback(
    (row, col) => {
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
    },
    [getId, getSelf]
  );

  return (
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
