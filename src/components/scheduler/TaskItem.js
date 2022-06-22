import DoneIcon from "@mui/icons-material/Done";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import TaskEditor from "./TaskEditor";
import Grow from "@mui/material/Grow";
import classes from "./TaskItem.module.css";

TaskItem.propTypes = {
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

  _setMatrix: PropTypes.func.isRequired,
  _setTask: PropTypes.func.isRequired,
  matrix: PropTypes.array.isRequired,
  deleteTask: PropTypes.func.isRequired,
  setTaskFields: PropTypes.func.isRequired,
};

function TaskItem({
  self,
  _setMatrix,
  _setTask,
  matrix,
  deleteTask,
  setTaskFields,
}) {
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: "TASK",
      item: { task: self },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [self]
  );

  function markTaskAsComplete() {
    setTaskFields(self._id, { isCompleted: true });
  }

  const styles = {
    color: self.isCompleted ? "grey" : "#4496b1",
  };

  function handleMouseEnter() {
    setIsMouseOver(true);
  }

  function handleMouseLeave() {
    setIsMouseOver(false);
  }

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <Grow in={true}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: self.isCompleted ? "lightgrey" : "lightblue",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem",
          borderRadius: "5px",
          opacity: isDragging ? "0.75" : "1",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            title="Drag task onto timetable"
            ref={drag}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DragIndicatorIcon sx={{ cursor: "grab" }} />
          </div>

          <div style={{ marginLeft: "0.5rem", wordBreak: "break-word" }}>
            <div className={classes["task-paragraph"]}>
              <span style={styles}>[{self.moduleCode}]</span> {self.name} (
              {self.durationHours} hr)
            </div>

            <div>
              <span style={styles}>due on:</span> {self.dueDate}@
              {convert_24H_to_12H(self.dueTime)}
            </div>
          </div>
        </div>

        <div
          style={{
            visibility: isMouseOver && !isDragging ? "visible" : "hidden",
          }}
        >
          <TaskEditor
            self={self}
            _setMatrix={_setMatrix}
            _setTask={_setTask}
            matrix={matrix}
            deleteTask={deleteTask}
          />

          <Tooltip title="Mark Task as Complete">
            <IconButton size="small" onClick={markTaskAsComplete}>
              <DoneIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Grow>
  );
}

function convert_24H_to_12H(time24H) {
  const [hour, min] = time24H.split(":");
  const hourNumber = Number(hour);

  if (hourNumber === 0) {
    return `12:${min}am`;
  }

  if (hourNumber >= 1 && hourNumber <= 11) {
    return `${hour}:${min}am`;
  }

  const hourPM = (hourNumber - 12).toString();
  return `${hourPM}:${min}pm`;
}

export default TaskItem;
