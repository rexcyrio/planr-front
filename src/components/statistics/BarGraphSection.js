import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState } from "react";
import styles from "./BarGraphSection.module.css";
import WeeklyTasksBarGraph from "./WeeklyTasksBarGraph";

function BarGraphSection() {
  const [taskType, setTaskType] = useState("All tasks");

  function selectChangeHandler(event) {
    setTaskType(event.target.value);
  }

  return (
    <div className={styles["section-container"]}>
      <WeeklyTasksBarGraph taskType={taskType} />
      <FormControl size="small" sx={{ width: "10rem", marginTop: "1rem" }}>
        <InputLabel sx={{ alignContent: "center" }}>Task Type</InputLabel>
        <Select
          value={taskType}
          label="Task type"
          onChange={selectChangeHandler}
        >
          <MenuItem value={"All tasks"}>All tasks</MenuItem>
          <MenuItem value={"Completed"}>Completed</MenuItem>
          <MenuItem value={"Incomplete"}>Incomplete</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

export default BarGraphSection;
