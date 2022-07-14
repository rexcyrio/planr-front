import React from "react";
import TasksAmountLineChart from "./TasksAmountLineChart";
import styles from "./LineChartSection.module.css";

function LineChartSection() {
  return (
    <div className={styles["section-container"]}>
      <TasksAmountLineChart />
    </div>
  );
}

export default LineChartSection;
