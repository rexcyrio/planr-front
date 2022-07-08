import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem 0",
        }}
      >
        <Tooltip title="Previous week" placement="left">
          <IconButton size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <div style={{ margin: "0 0.75rem" }}>
          {getWeekRange(getMondayDateString(new Date()))}
        </div>

        <Tooltip title="Next week" placement="right">
          <IconButton size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>

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

function getMondayDateString(dateObject) {
  const day = dateObject.getDay();

  if (day === 0) {
    // is Sunday
    const monday = new Date(
      new Date(dateObject).setDate(dateObject.getDate() - 6)
    );
    return convertToDateString(monday);
  } else if (day === 1) {
    // is Monday
    return convertToDateString(dateObject);
  } else {
    // is other days of the week
    const monday = new Date(
      new Date(dateObject).setDate(dateObject.getDate() - (day - 1))
    );
    return convertToDateString(monday);
  }
}

function getWeekRange(mondayDateString) {
  const [date, shortMonthName, year] = mondayDateString.split(" ");

  const monthNumber = mappingShortMonthNameToMonthNumber[shortMonthName];
  const dateNumber = Number(date);

  const monday = new Date(year, monthNumber, dateNumber);
  const sunday = new Date(year, monthNumber, dateNumber + 6);
  return `${convertToDateString(monday)} - ${convertToDateString(sunday)}`;
}

function convertToDateString(dateObject) {
  // "Wed Jul 28 1993"
  const str = dateObject.toDateString();

  // ["Jul", "28", "1993"]
  const [shortMonthName, date, year] = str.split(" ").slice(1);

  return `${date} ${shortMonthName} ${year}`;
}

const mappingShortMonthNameToMonthNumber = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

export default Timetable;
