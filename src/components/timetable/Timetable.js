import React from "react";
import { useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import LineMarker from "../timetable/LineMarker";
import TimetableCell from "../timetable/TimetableCell";
import styles from "./Timetable.module.css";

function Timetable() {
  const tasks = useSelector((state) => state.tasks.data);
  const modules = useSelector((state) => state.modules);
  const matrix = useSelector((state) => state.matrix);

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

export default Timetable;
