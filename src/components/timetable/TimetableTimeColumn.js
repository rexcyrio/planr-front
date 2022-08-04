import React from "react";
import { ScrollSyncPane } from "react-scroll-sync";
import styles from "./Timetable.module.css";

function TimetableTimeColumn() {
  return (
    <ScrollSyncPane group="vertical">
      <div
        className="hide-scrollbar"
        style={{
          height: "100%",
          flexShrink: "0",
          overflow: "auto",
        }}
      >
        <div style={{ width: "6rem" }}>
          <table
            style={{
              borderCollapse: "collapse",
              marginBottom: "1rem",
            }}
          >
            <tbody>
              {timePairArray.map((timePair) => {
                const [time24H, time24H_] = timePair;

                return (
                  <tr key={time24H}>
                    <td className={styles["cell"]}>
                      {time24H} - {time24H_}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ScrollSyncPane>
  );
}

const timePairArray = (() => {
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
})();

function zeroPad(num, places) {
  return String(num).padStart(places, "0");
}

export default React.memo(TimetableTimeColumn);
