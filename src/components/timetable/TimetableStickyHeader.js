import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { ScrollSyncPane } from "react-scroll-sync";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";
import styles from "./Timetable.module.css";

function TimetableStickyHeader() {
  const timetableColumn = useSelector((state) => state.time.timetableColumn);
  const mondayKey = useSelector((state) => state.time.mondayKey);

  const currentWeekHeader = useMemo(
    () =>
      allDays.map((day) => {
        const columnNumber = mappingDayToColumnNumber[day];

        return (
          <React.Fragment key={day}>
            {timetableColumn === columnNumber ? (
              <th
                className={styles["cell-current-day"]}
                style={{ backgroundClip: "padding-box" }}
              >
                {day}
              </th>
            ) : (
              <th className={styles["cell"]}>{day}</th>
            )}
          </React.Fragment>
        );
      }),
    [timetableColumn]
  );

  const otherWeekHeader = useMemo(
    () =>
      allDays.map((day) => (
        <React.Fragment key={day}>
          <th className={styles["cell"]}>{day}</th>
        </React.Fragment>
      )),
    []
  );

  const topLeftSingleHeaderCell = useMemo(
    () => (
      <div
        style={{
          width: "6rem",
          flexShrink: "0",
        }}
      >
        <table className={styles["sticky-table"]}>
          <thead>
            <tr>
              <th className={styles["cell"]}>&nbsp;</th>
            </tr>
          </thead>
        </table>
      </div>
    ),
    []
  );

  return (
    <div
      className={styles["sticky-container"]}
      style={{
        width: "100%",
        display: "flex",
      }}
    >
      {topLeftSingleHeaderCell}

      <ScrollSyncPane group="horizontal">
        <div
          className="hide-scrollbar"
          style={{
            width: "calc(100% - 6rem)",
            flexShrink: "0",
            overflow: "auto",
          }}
        >
          <div style={{ width: "41.9rem" }}>
            <table className={styles["sticky-table"]}>
              <thead>
                <tr>
                  {isCurrentWeek(mondayKey)
                    ? currentWeekHeader
                    : otherWeekHeader}
                </tr>
              </thead>
            </table>
          </div>
        </div>
      </ScrollSyncPane>
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

export default React.memo(TimetableStickyHeader);
