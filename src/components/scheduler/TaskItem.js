import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PropTypes from "prop-types";
import React from "react";
import { useDrag } from "react-dnd";
import styles from "./TaskItem.module.css";

TaskItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    dueDate: PropTypes.string,
    dueTime: PropTypes.string,
    durationHours: PropTypes.string,
    timeUnits: PropTypes.number,
    moduleCode: PropTypes.string,
  }),
};

function TaskItem({ self }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    // "type" is required. It is used by the "accept" specification of drop targets.
    type: "TASK",
    item: { task: self },
    // The collect function utilizes a "monitor" instance (see the Overview for what this is)
    // to pull important pieces of state from the DnD system.
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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

  return (
    <div
      style={{
        backgroundColor: "lightblue",
        display: "flex",
        alignItems: "center",
        padding: "0.5rem",
        margin: "0.5rem",
        borderRadius: "5px",
        opacity: isDragging ? "0.75" : "1",
      }}
    >
      <div
        ref={drag}
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
        }}
      >
        <DragIndicatorIcon sx={{ cursor: "grab" }} />
      </div>

      <div style={{ marginLeft: "0.5rem" }}>
        <div>
          <span className={styles["accent"]}>[{self.moduleCode}]</span>{" "}
          {self.name} ({self.durationHours} hr)
        </div>

        <div>
          <span className={styles["accent"]}>due on:</span> {self.dueDate}@
          {convert_24H_to_12H(self.dueTime)}
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
