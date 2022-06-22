import DoneIcon from "@mui/icons-material/Done";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RestoreIcon from "@mui/icons-material/Restore";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import TaskEditor from "./TaskEditor";
import classes from "./TaskItem.module.css";
import getBackgroundColour from "../../helper/colorHelper";

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

  function markTaskAsIncomplete() {
    setTaskFields(self._id, { isCompleted: false });
  }

  function getAccentColour() {
    if (self.isCompleted) {
      return "grey";
    }

    switch (self.moduleCode) {
      case "CS1101S":
        return eightiesColourScheme["darkRed"];
      case "CS1231S":
        return eightiesColourScheme["darkYellow"];
      case "MA1521":
        return eightiesColourScheme["darkGreen"];
      default:
        return "#cd6373";
    }
  }

  function getDraggableState() {
    if (self.isCompleted) {
      return {
        title: "Task is already completed",
        ref: null,
        cursor: "not-allowed",
      };
    }

    if (self.row !== -1 && self.col !== -1) {
      return {
        title: "Task is already scheduled",
        ref: null,
        cursor: "not-allowed",
      };
    }

    return {
      title: "Drag task onto timetable",
      ref: drag,
      cursor: "grab",
    };
  }

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
      <Paper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div
          style={{
            backgroundColor: getBackgroundColour(self),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.5rem",
            borderRadius: "5px",
            opacity: isDragging ? "0.75" : "1",
          }}
        >
          {/* ============================================================= */}
          {/* LHS */}
          {/* ============================================================= */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* =========================================================== */}
            {/* Drag Icon */}
            {/* =========================================================== */}

            <div
              title={getDraggableState().title}
              ref={getDraggableState().ref}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: getDraggableState().cursor,
              }}
            >
              {self.isCompleted ? (
                <AssignmentTurnedInIcon />
              ) : self.row !== -1 ? (
                <StickyNote2Icon />
              ) : (
                <DragIndicatorIcon />
              )}
            </div>

            {/* =========================================================== */}
            {/* Text */}
            {/* =========================================================== */}

            <div style={{ marginLeft: "0.5rem", wordBreak: "break-word" }}>
              <div className={classes["task-paragraph"]}>
                <span
                  style={{
                    color: getAccentColour(),
                  }}
                >
                  [{self.moduleCode}]
                </span>{" "}
                {self.name} ({self.durationHours} hr)
              </div>

              <div>
                <span
                  style={{
                    color: getAccentColour(),
                  }}
                >
                  due on:
                </span>{" "}
                {self.dueDate}@{convert_24H_to_12H(self.dueTime)}
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* RHS icons*/}
          {/* ============================================================= */}

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

            {self.isCompleted ? (
              <Tooltip title="Restore task">
                <IconButton size="small" onClick={markTaskAsIncomplete}>
                  <RestoreIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Mark task as complete">
                <IconButton size="small" onClick={markTaskAsComplete}>
                  <DoneIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
      </Paper>
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

const eightiesColourScheme = {
  red: "#e91a1f",
  lightRed: "#f2777a",
  darkRed: "#8f0e11",

  orange: "#e25608",
  lightOrange: "#f99157",
  darkOrange: "#7f3105",

  yellow: "#fa0",
  lightYellow: "#fc6",
  darkYellow: "#960",

  green: "#5a5",
  lightGreen: "#9c9",
  darkGreen: "#363",

  cyan: "#399",
  lightCyan: "#6cc",
  darkCyan: "#1a4d4d",

  blue: "#369",
  lightBlue: "#69c",
  darkBlue: "#1a334d",

  purple: "#a5a",
  lightPurple: "#c9c",
  darkPurple: "#636",

  brown: "#974b28",
  lightBrown: "#d27b53",
  darkBrown: "#472312",
};

export default TaskItem;
