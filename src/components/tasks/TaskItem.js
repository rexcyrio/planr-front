import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import DoneIcon from "@mui/icons-material/Done";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import RestoreIcon from "@mui/icons-material/Restore";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { selfPropTypes } from "../../helper/selfPropTypesHelper";
import { getAccentColour, getBackgroundColour } from "../../helper/themeHelper";
import { blackenCells, refreshMatrix } from "../../store/slices/matrixSlice";
import {
  markTaskAsComplete,
  markTaskAsIncomplete,
} from "../../store/slices/tasksSlice";
import TaskEditor from "./TaskEditor";
import classes from "./TaskItem.module.css";

TaskItem.propTypes = {
  self: selfPropTypes,
};

function TaskItem({ self }) {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );
  const [isMouseOver, setIsMouseOver] = useState(false);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      // "type" is required. It is used by the "accept" specification of drop targets.
      type: "TASK",
      item: () => {
        if (self.dueDate === "--") {
          dispatch(blackenCells());
        }
        return { task: self };
      },
      end: (item, monitor) => {
        const { dueDate } = item.task;

        if (dueDate === "--") {
          dispatch(refreshMatrix());
        }
      },
      // The collect function utilizes a "monitor" instance (see the Overview for what this is)
      // to pull important pieces of state from the DnD system.
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [self]
  );

  const getDraggableState = useCallback(() => {
    if (self.isCompleted[mondayKey] !== undefined) {
      return {
        title: "Task is already completed",
        ref: null,
        cursor: "not-allowed",
      };
    }

    if (self.row !== -1 && self.col !== -1) {
      return {
        title: `Task is already scheduled on ${
          mappingColumnToDay[self.col]
        } at ${getTime(self.row)}`,
        ref: null,
        cursor: "not-allowed",
      };
    }

    return {
      title: "Drag task onto timetable",
      ref: drag,
      cursor: "grab",
    };
  }, [self, drag, mondayKey]);

  const handleMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const taskItemDescription = useMemo(
    () => (
      <div style={{ marginLeft: "0.5rem", wordBreak: "break-word" }}>
        <div className={classes["task-paragraph"]}>
          <span
            style={{
              color: getAccentColour(
                themeName,
                mappingTagToColourName,
                self,
                mondayKey
              ),
            }}
          >
            [{self.tag}]
          </span>{" "}
          {self.name} ({self.durationHours} hr)
        </div>

        {self.dueDate === "--" ? (
          <span
            style={{
              color: getAccentColour(
                themeName,
                mappingTagToColourName,
                self,
                mondayKey
              ),
            }}
          >
            Recurring
          </span>
        ) : (
          <div>
            <span
              style={{
                color: getAccentColour(
                  themeName,
                  mappingTagToColourName,
                  self,
                  mondayKey
                ),
              }}
            >
              due on:
            </span>{" "}
            {self.dueDate}@{convert_24H_to_12H(self.dueTime)}
          </div>
        )}
      </div>
    ),
    [self, mappingTagToColourName, themeName, mondayKey]
  );

  const dragIcon = useMemo(
    () => (
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
        {self.isCompleted[mondayKey] !== undefined ? (
          <AssignmentTurnedInIcon />
        ) : self.row !== -1 ? (
          <StickyNote2Icon />
        ) : (
          <DragIndicatorIcon />
        )}
      </div>
    ),
    [self, mondayKey, getDraggableState]
  );

  const restoreTaskButton = useMemo(
    () => (
      <Tooltip title="Restore task">
        <IconButton
          size="small"
          onClick={() => dispatch(markTaskAsIncomplete(self._id))}
        >
          <RestoreIcon />
        </IconButton>
      </Tooltip>
    ),
    [dispatch, self._id]
  );

  const markTaskAsCompleteButton = useMemo(
    () => (
      <Tooltip title="Mark task as complete">
        <IconButton
          size="small"
          onClick={() => dispatch(markTaskAsComplete(self._id))}
        >
          <DoneIcon />
        </IconButton>
      </Tooltip>
    ),
    [dispatch, self._id]
  );

  return (
    <Grow in={true}>
      <Paper onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div
          style={{
            backgroundColor: getBackgroundColour(
              themeName,
              mappingTagToColourName,
              self,
              mondayKey
            ),
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
            {dragIcon}
            {taskItemDescription}
          </div>

          {/* ============================================================= */}
          {/* RHS icons*/}
          {/* ============================================================= */}

          <div
            style={{
              visibility: isMouseOver && !isDragging ? "visible" : "hidden",
              display: "flex",
              alignItems: "flex-end",
            }}
          >
            <TaskEditor self={self} />

            {self.isCompleted[mondayKey] !== undefined
              ? restoreTaskButton
              : markTaskAsCompleteButton}
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

const mappingColumnToDay = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

function getTime(row) {
  const hour = Math.floor(row / 2);
  const min = row % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
}

export default React.memo(TaskItem);
