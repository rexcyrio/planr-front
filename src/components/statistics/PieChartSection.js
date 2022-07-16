import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React, { useState } from "react";
import styles from "./PieChartSection.module.css";
import WeeklyTasksTypesPieChart from "./WeeklyTasksTypesPieChart";

function PieChartSection() {
  const [durationType, setDurationType] = useState("All");

  function selectChangeHandler(event) {
    setDurationType(event.target.value);
  }

  return (
    <div className={styles["section-container"]}>
      <div style={{ width: "60%" }}>
        <WeeklyTasksTypesPieChart durationType={durationType} />
      </div>
      <FormControl size="small" sx={{ width: "10rem", marginTop: "1.5rem" }}>
        <InputLabel sx={{ alignContent: "center" }}>Duration Type</InputLabel>
        <Select
          value={durationType}
          label="Duration type"
          onChange={selectChangeHandler}
        >
          <MenuItem value={"All"}>All</MenuItem>
          <MenuItem value={"Reference week"}>Reference week</MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}

export default PieChartSection;
