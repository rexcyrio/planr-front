import React, { useState } from "react";
import WeeklyTasksBarGraph from "./WeeklyTasksBarGraph";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import styles from "./BarGraphSection.module.css";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

function BarGraphSection() {
  const [taskType, setTaskType] = useState("All tasks");

  function selectChangeHandler(event) {
    setTaskType(event.target.value);
  }

  return (
    <div className={styles["section-container"]}>
      <div className={styles.graph}>
        <WeeklyTasksBarGraph />
      </div>
      <FormControl size="small" sx={{ width: "10rem" }}>
        <InputLabel sx={{ alignContent: "center" }}>Age</InputLabel>
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
