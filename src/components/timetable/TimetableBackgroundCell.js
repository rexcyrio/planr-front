import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";
import styles from "./Timetable.module.css";

TimetableBackgroundCell.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
};

function TimetableBackgroundCell({ row, col }) {
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const matrixCell = useSelector((state) => state.matrix[row][col]);
  const timetableColumn = useSelector((state) => state.time.timetableColumn);

  const backgroundColor = useMemo(() => {
    if (matrixCell === "black") {
      return "grey";
    }

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
  }, [row, col, mondayKey, matrixCell, timetableColumn]);

  const cell = useMemo(
    () => (
      <td
        className={styles["cell"]}
        style={{
          backgroundColor: backgroundColor,
          backgroundClip: "padding-box",
        }}
      >
        &nbsp;
      </td>
    ),
    [backgroundColor]
  );

  return cell;
}

export default React.memo(TimetableBackgroundCell);
