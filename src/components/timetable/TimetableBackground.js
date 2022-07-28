import React from "react";
import styles from "./Timetable.module.css";
import TimetableBackgroundCell from "./TimetableBackgroundCell";

const dummyMatrix = new Array(48).fill(0);

function TimetableBackground() {
  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: "0",
        height: "100%",
        width: "100%",
      }}
    >
      <table className={styles["timetable-table"]}>
        <tbody>
          {dummyMatrix.map((_, row) => (
            <tr key={row}>
              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                <React.Fragment key={`${row},${col}`}>
                  <TimetableBackgroundCell row={row} col={col} />
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(TimetableBackground);
