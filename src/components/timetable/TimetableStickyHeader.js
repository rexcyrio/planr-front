import styles from "./Timetable.module.css";
import React from "react";
import { useSelector } from "react-redux";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";

function TimetableStickyHeader() {
  const timetableColumn = useSelector((state) => state.time.timetableColumn);
  const mondayKey = useSelector((state) => state.time.mondayKey);

  function getCurrentWeekTableHeaderCell(day) {
    const columnNumber = mappingDayToColumnNumber[day];

    if (timetableColumn === columnNumber) {
      return <th className={styles["cell-current-day"]}>{day}</th>;
    } else {
      return <th className={styles["cell"]}>{day}</th>;
    }
  }

  return (
    <div className={styles["sticky-container"]}>
      <table className={styles["sticky-table"]}>
        <thead>
          {isCurrentWeek(mondayKey) ? (
            <tr>
              <th className={styles["cell"]}></th>

              {allDays.map((day) => (
                <React.Fragment key={day}>
                  {getCurrentWeekTableHeaderCell(day)}
                </React.Fragment>
              ))}
            </tr>
          ) : (
            <tr>
              <th className={styles["cell"]}></th>

              {allDays.map((day) => (
                <React.Fragment key={day}>
                  <th className={styles["cell"]}>{day}</th>
                </React.Fragment>
              ))}
            </tr>
          )}
        </thead>
      </table>
    </div>
  );
}

const allDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const mappingDayToColumnNumber = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

export default TimetableStickyHeader;
