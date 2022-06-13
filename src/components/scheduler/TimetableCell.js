import PropTypes from "prop-types";
import React from "react";
import { useDrop } from "react-dnd";
import styles from "./Scheduler.module.css";

TimetableCell.propTypes = {
  name: PropTypes.string,
  row: PropTypes.number,
  col: PropTypes.number,
  rowSpan: PropTypes.number,
  matrix: PropTypes.array,
  scheduleTask: PropTypes.func,
};

function TimetableCell({ name, row, col, rowSpan, matrix, scheduleTask }) {
  function getTaskID(row, col) {
    return matrix[row][col];
  }

  function getNumberOfAvailableTimeUnits(row, col) {
    if (getTaskID(row, col) !== "0") {
      return 0;
    }

    let rowPointer = row;
    while (rowPointer + 1 < 48 && getTaskID(rowPointer + 1, col) === "0") {
      rowPointer += 1;
    }
    return rowPointer - row + 1;
  }

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item) => {
        const { task } = item;
        scheduleTask(task, row, col);
      },
      canDrop: (item) => {
        const { task } = item;
        return task.timeUnits <= getNumberOfAvailableTimeUnits(row, col);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [row, col, matrix]
  );

  return (
    <td
      ref={drop}
      className={styles["cell"]}
      rowSpan={rowSpan}
      style={{ backgroundColor: isOver ? (canDrop ? "green" : "red") : "" }}
    >
      {name}
    </td>
  );
}

export default TimetableCell;
