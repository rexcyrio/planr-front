import styles from "./Timetable.module.css";
import React from "react";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";
import { useSelector } from "react-redux";

function TimetableBackground() {
  const matrix = useSelector((state) => state.matrix);
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const timetableColumn = useSelector((state) => state.time.timetableColumn);

  function getAlternatingBackgroundColour(row, col) {
    if (isCurrentWeek(mondayKey)) {
      if (col === timetableColumn) {
        if (Math.floor(row / 2) % 2 === 0) {
          return "#e5f8eb";
        }
        return "#d8ebdf";
      }
    }

    if (col % 2 === 0) {
      if (Math.floor(row / 2) % 2 === 0) {
        return "transparent";
      }
      return "#f2f2f2";
    }

    if (Math.floor(row / 2) % 2 === 0) {
      return "#f2f2f2";
    }
    
    return "#e6e6e6";
  }

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
          {new Array(48).fill(0).map((_, row) => (
            <tr key={row}>
              <td className={styles["cell"]}></td>

              {[0, 1, 2, 3, 4].map((col) => (
                <React.Fragment key={`(${row}, ${col})`}>
                  <td
                    className={styles["cell"]}
                    style={{
                      backgroundColor:
                        matrix[row][col] === "black"
                          ? "grey"
                          : getAlternatingBackgroundColour(row, col),
                    }}
                  >
                    &nbsp;
                  </td>
                </React.Fragment>
              ))}

              <td className={styles["cell"]}></td>

              {[5, 6].map((col) => (
                <React.Fragment key={`(${row}, ${col})`}>
                  <td
                    className={styles["cell"]}
                    style={{
                      backgroundColor:
                        matrix[row][col] === "black"
                          ? "grey"
                          : getAlternatingBackgroundColour(row, col),
                    }}
                  >
                    &nbsp;
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TimetableBackground;
