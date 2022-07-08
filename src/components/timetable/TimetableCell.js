import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Card from "@mui/material/Card";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { getBackgroundColour } from "../../helper/themeHelper";
import { setMatrix } from "../../store/slices/matrixSlice";
import { updateTaskFields } from "../../store/slices/tasksSlice";
import DetailsPopover from "./DetailsPopover";
import styles from "./TimetableCell.module.css";

const MemoDragIndicatorIcon = React.memo(function IconWrapper() {
  return (
    <DragIndicatorIcon
      fontSize="inherit"
      sx={{
        color: "hsl(0, 0%, 25%)",
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
    links: PropTypes.array.isRequired,

    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    timeUnits: PropTypes.number.isRequired,

    isCompleted: PropTypes.bool.isRequired,
  }).isRequired,

  row: PropTypes.number.isRequired,
  col: PropTypes.number.isRequired,
};

function TimetableCell({ self, row, col }) {
  const dispatch = useDispatch();
  const matrix = useSelector((state) => state.matrix);
  const themeName = useSelector((state) => state.themeName);
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.mappingModuleCodeToColourName
  );

  const [droppingTaskTimeUnits, setDroppingTaskTimeUnits] = useState(0);
  const [isMouseOver, setIsMouseOver] = useState(false);

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

  // ==========================================================================
  // Drag and drop
  // ==========================================================================

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

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "TASK",
      item: () => {
        setTimeout(() => {
          // temporarily set taskId to "0"
          const values = [];

          for (let i = 0; i < self.timeUnits; i++) {
            values.push([row + i, col, "0"]);
          }

          dispatch(setMatrix(values));

          dispatch(
            updateTaskFields(self._id, {
              row: -1,
              col: -1,
            })
          );
        }, 0);

        return { task: self };
      },
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

  return (
    <>
      <td
        ref={drop}
        className={styles["cell"]}
        rowSpan={self.timeUnits}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isNonEmptyItem(self) && (
          <Card
            sx={{
              backgroundColor: getBackgroundColour(
                themeName,
                mappingModuleCodeToColourName,
                self
              ),
              margin: 0,
              height: `${(1.3125 + 1 / 16) * self.timeUnits - 0.1875}rem`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {isModuleItem(self) ? (
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    paddingLeft: "0.25rem",
                  }}
                >
                  {self.moduleCode}
                </div>
              ) : (
                <div
                  title="Move task around"
                  ref={drag}
                  style={{
                    width: "fit-content",
                    cursor: "grab",
                    visibility: isMouseOver ? "visible" : "hidden",
                    fontSize: "0.95rem",
                  }}
                >
                  <MemoDragIndicatorIcon />
                </div>
              )}
              <DetailsPopover self={self} />
            </div>

            <div
              title={self.name}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: `${self.timeUnits - 1}`,
                overflow: "hidden",
                width: "auto",
                maxWidth: "5.55rem",
                paddingLeft: "0.25rem",
              }}
            >
              {self.name}
            </div>
          </Card>
        )}
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

function isModuleItem(self) {
  return self._id.slice(0, 2) === "__";
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
