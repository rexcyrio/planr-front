import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import PropTypes from "prop-types";
import React, { useEffect, useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import styles from "./TimetableCell.module.css";

const MemoDragIndicatorIcon = React.memo(function IconWrapper() {
  return (
    <DragIndicatorIcon
      fontSize="inherit"
      sx={{
        color: "hsl(0, 0%, 75%)",
      }}
    />
  );
});

TimetableCell.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,

    name: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    dueTime: PropTypes.string.isRequired,
    durationHours: PropTypes.string.isRequired,
    moduleCode: PropTypes.string.isRequired,

    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    timeUnits: PropTypes.number.isRequired,

    isCompleted: PropTypes.bool.isRequired,
  }).isRequired,

  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
  matrix: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  _setMatrix: PropTypes.func.isRequired,
  setTaskFields: PropTypes.func.isRequired,
};

function TimetableCell({
  self,
  row,
  col,
  matrix,
  tasks,
  _setMatrix,
  setTaskFields,
}) {
  const [droppingTaskTimeUnits, setDroppingTaskTimeUnits] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  let elRef = useRef(null);

  function handleMouseEnter() {
    // if the user is dragging an item around, it shouldn't make the
    // drag indicator icon appear
    if (isDragging) {
      return;
    }
    setIsMouseOver(true);
  }

  function handleMouseLeave() {
    setIsMouseOver(false);
  }

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

  const openPopoverHandler = (event) => {
    setOpenPopover(true);
  };

  const closePopoverHandler = () => {
    setOpenPopover(false);
  };

  // ==========================================================================
  // Drag and drop
  // ==========================================================================

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "TASK",
      drop: (item) => {
        const { _id: taskID, timeUnits } = item.task;

        // add task to matrix
        for (let i = 0; i < timeUnits; i++) {
          _setMatrix(row + i, col, taskID);
        }

        // update `row` and `col` fields accordingly
        setTaskFields(taskID, { row: row, col: col });
      },
      canDrop: (item) => {
        const { timeUnits } = item.task;

        // update task silhouette
        setDroppingTaskTimeUnits(timeUnits);

        return timeUnits <= getNumberOfAvailableTimeUnits(row, col);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [matrix, tasks]
  );

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "TASK",
      item: { task: self },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [self]
  );

  // needed for custom drag layer
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  useEffect(() => {
    if (isDragging) {
      if (isMouseOver) {
        setIsMouseOver(false);
      }

      for (let i = 0; i < self.timeUnits; i++) {
        // temporarily set taskID to "0"
        _setMatrix(row + i, col, "0");
      }
    } else {
      for (let i = 0; i < self.timeUnits; i++) {
        // set taskID back
        _setMatrix(row + i, col, self._id);
      }
    }
  }, [isDragging]);

  return (
    <>
      <td
        ref={drop}
        className={styles["cell"]}
        rowSpan={self.timeUnits}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          verticalAlign: "top",
        }}
      >
        <div className={styles["cell-top"]}>
          <div
            title="Move task around"
            ref={drag}
            style={{
              width: "fit-content",
              cursor: "grab",
              visibility:
                self._id !== "0" && isMouseOver ? "visible" : "hidden",
              fontSize: "0.95rem",
            }}
          >
            <MemoDragIndicatorIcon />
          </div>
          {self._id !== "0" && (
            <div
              className={styles["details-popup"]}
              ref={elRef}
              onClick={openPopoverHandler}
            >
              Details
            </div>
          )}
        </div>

        <div
          title={self.name}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: `${self.timeUnits - 1}`,
            overflow: "hidden",
            width: "5.7rem",
          }}
        >
          {self.name}
        </div>

        {isOver ? (
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
        ) : (
          <></>
        )}
      </td>
      {self._id !== "0" && (
        <Popover
          open={openPopover}
          anchorEl={elRef.current}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          onClose={closePopoverHandler}
        >
          <Box
            sx={{
              border: 1,
              p: 1,
              bgcolor: "background.paper",
            }}
          >
            <p>{self.moduleCode}</p>
            <p>
              Due on: {self.dueDate} at {self.dueTime}
            </p>
            <p>Duration: {self.durationHours} hours</p>
            <p>Status: {self.isCompleted ? "Completed" : "Not Completed"}</p>
          </Box>
        </Popover>
      )}
    </>
  );
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
