import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import { setMatrix } from "../../store/slices/matrixSlice";
import { updateTaskFields } from "../../store/slices/tasksSlice";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import styles from "./TimetableCell.module.css";
import TimetableCellCard from "./TimetableCellCard";

TimetableCell.propTypes = {
  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
};

function TimetableCell({ row, col }) {
  const dispatch = useDispatch();
  const tasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
  const matrix = useSelector((state) => state.matrix);
  const [droppingTaskTimeUnits, setDroppingTaskTimeUnits] = useState(0);

  const isBlack = useMemo(
    () => matrix[row][col] === "black",
    [matrix, row, col]
  );

  const getId = useCallback((row, col) => matrix[row][col], [matrix]);

  const self = useMemo(() => {
    const id = getId(row, col);

    if (id === "0" || id === "black") {
      return EMPTY_TASK;
    }

    if (id.slice(0, 2) === "__") {
      return modules.find((each) => each._id === id);
    }

    return tasks.find((each) => each._id === id);
  }, [getId, row, col, modules, tasks]);

  const numberOfAvailableTimeUnits = useMemo(() => {
    if (getId(row, col) !== "0") {
      return 0;
    }

    let rowPointer = row;
    while (rowPointer + 1 < 48 && getId(rowPointer + 1, col) === "0") {
      rowPointer += 1;
    }

    return rowPointer - row + 1;
  }, [getId, row, col]);

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

  if (
    isNonEmptyItem(self) &&
    row > 0 &&
    getId(row - 1, col) === getId(row, col)
  ) {
    // render nothing to enable the cell to span multiple rows
    return <></>;
  }

  return (
    <td ref={drop} className={styles["cell"]} rowSpan={self.timeUnits}>
      {isNonEmptyItem(self) ? <TimetableCellCard self={self} /> : <>&nbsp;</>}
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

  const adjustments = Math.floor((timeUnits - 1) / 2) * 0.05;
  const total = roundOff(timeUnits * 1.35 + adjustments, 2);
  return `${total}rem`;
}

const mappingTimeUnitsToRemUnits = {
  0: 0,

  1: 1.35,
  2: 2.7,
  3: 4.1,
  4: 5.45,

  5: 6.85,
  6: 8.2,
  7: 9.6,
  8: 10.95,

  9: 12.35,
};

export default React.memo(TimetableCell);
