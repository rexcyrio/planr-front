import DoneIcon from "@mui/icons-material/Done";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RestoreIcon from "@mui/icons-material/Restore";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { getBackgroundColour } from "../../helper/colourHelper";
import { setMatrix } from "../../store/slices/matrixSlice";
import {
  markTaskAsComplete,
  markTaskAsIncomplete,
  updateTaskFields
} from "../../store/slices/tasksSlice";
import TaskEditor from "../tasks/TaskEditor";
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
  const themeState = useSelector((state) => state.theme);

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

  const openPopoverHandler = () => {
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
        const values = [];

        for (let i = 0; i < timeUnits; i++) {
          values.push([row + i, col, taskID]);
        }

        dispatch(setMatrix(values));

        // update `row` and `col` fields accordingly
        dispatch(updateTaskFields(taskID, { row: row, col: col }));
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
        {self._id !== "0" && (
          <Card
            sx={{
              backgroundColor: getBackgroundColour(themeState, self),
              margin: 0,
              height: `${(1.3125 + 1 / 16) * self.timeUnits - 0.1875}rem`,
            }}
          >
            <div className={styles["cell-top"]}>
              <div
                title="Move task around"
                ref={drag}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
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
                width: "auto",
                maxWidth: "5.55rem",
                paddingLeft: "0.25rem",
              }}
            >
              {self.name}
            </div>
          </Card>
        )}
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
              borderRadius: "5px",
              p: 1,
              bgcolor: "background.paper",
              maxWidth: "16rem",
            }}
          >
            <div className={styles["details-popup-header-container"]}>
              <p className={styles["details-popup-header"]}>
                <strong>{self.moduleCode}</strong>
              </p>
              <div>
                <TaskEditor self={self} />
                {self.isCompleted ? (
                  <Tooltip title="Restore task">
                    <IconButton
                      size="small"
                      onClick={() => dispatch(markTaskAsIncomplete(self._id))}
                    >
                      <RestoreIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Mark task as complete">
                    <IconButton
                      size="small"
                      onClick={() => dispatch(markTaskAsComplete(self._id))}
                    >
                      <DoneIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
            <p className={styles["task-name-paragraph"]}>{self.name}</p>
            <p>
              Due on: {self.dueDate} at {self.dueTime}
            </p>
            <p>Duration: {self.durationHours} hours</p>
            <p>Status: {self.isCompleted ? "Completed" : "Not Completed"}</p>
            {self.links.map((link) => (
              <React.Fragment key={link._id}>
                <a href={link.url} rel="noreferrer noopener" target="_blank">
                  {link.name}
                </a>
                <br />
              </React.Fragment>
            ))}
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