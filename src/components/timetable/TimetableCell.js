import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { setMatrix } from "../../store/slices/matrixSlice";
import { updateTaskFields } from "../../store/slices/tasksSlice";
import styles from "./TimetableCell.module.css";
import TimetableCellCard from "./TimetableCellCard";

TimetableCell.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,

    name: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    dueTime: PropTypes.string.isRequired,
    durationHours: PropTypes.string.isRequired,
    moduleCode: PropTypes.string.isRequired,
    links: PropTypes.array.isRequired,

    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    timeUnits: PropTypes.number.isRequired,

    isCompleted: PropTypes.bool.isRequired,
    mondayKey: PropTypes.array.isRequired,
  }).isRequired,

  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,

  isBlack: PropTypes.bool,
};

function TimetableCell({ self, row, col, isBlack = false }) {
  const dispatch = useDispatch();
  const matrix = useSelector((state) => state.matrix);
  const [droppingTaskTimeUnits, setDroppingTaskTimeUnits] = useState(0);

  const numberOfAvailableTimeUnits = useMemo(() => {
    function getId(row, col) {
      return matrix[row][col];
    }

    if (getId(row, col) !== "0") {
      return 0;
    }

    let rowPointer = row;
    while (rowPointer + 1 < 48 && getId(rowPointer + 1, col) === "0") {
      rowPointer += 1;
    }

    return rowPointer - row + 1;
  }, [row, col, matrix]);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item) => {
        const { _id: taskId, timeUnits } = item.task;

        // add task to matrix
        const values = [];

        for (let i = 0; i < timeUnits; i++) {
          values.push([row + i, col, taskId]);
        }

        dispatch(setMatrix(values));

        // update `row` and `col` fields accordingly
        dispatch(updateTaskFields(taskId, { row: row, col: col }));
      },
      hover: (item) => {
        // update task silhouette
        const { timeUnits } = item.task;
        if (droppingTaskTimeUnits !== timeUnits) {
          setDroppingTaskTimeUnits(timeUnits);
        }
      },
      canDrop: (item) => {
        if (isBlack) {
          return false;
        }

        const { timeUnits } = item.task;
        return timeUnits <= numberOfAvailableTimeUnits;
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [matrix]
  );

  return (
    <>
      <td ref={drop} className={styles["cell"]} rowSpan={self.timeUnits}>
        {isNonEmptyItem(self) && <TimetableCellCard self={self} />}
        {isOver && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              height: getRem(droppingTaskTimeUnits),
              width: "5.9rem",
              zIndex: "4",
              backgroundColor: canDrop ? "green" : "red",
            }}
          ></div>
        )}
      </td>
    </>
  );
}

function isNonEmptyItem(self) {
  return self._id !== "0";
}

function roundOff(number, places) {
  const divisor = Math.pow(10, places);
  return Math.round(number * divisor) / divisor;
}

function getRem(timeUnits) {
  if (timeUnits in mappingTimeUnitsToRemUnits) {
    return `${mappingTimeUnitsToRemUnits[timeUnits]}rem`;
  }

  const numGaps = Math.floor((timeUnits - 1) / 4);
  const gapsRem = numGaps * 1.35;

  const numChunks = Math.floor(timeUnits / 4);
  const chunksRem = (numChunks - 1) * 4.2;

  const remainder = timeUnits % 4;
  const remainderRem = Math.max((remainder - 1) * 1.4, 0);

  const total = roundOff(5.5 + gapsRem + chunksRem + remainderRem, 2);
  return `${total}rem`;
}

const mappingTimeUnitsToRemUnits = {
  0: 0,

  1: 1.3,
  2: 2.7,
  3: 4.1,
  4: 5.5,

  5: 6.85,
  6: 8.25,
  7: 9.65,
  8: 11.05,

  9: 12.4,
};

export default TimetableCell;
