import React from "react";
import WeeklyTasksBarGraph from "./WeeklyTasksBarGraph";
import WeeklyTasksTypesPieChart from "./WeeklyTasksTypesPieChart";
import styles from "./StatsContent.module.css";

function StatsContent() {
  return (
    <div className={styles.charts}>
      <WeeklyTasksBarGraph />
      <WeeklyTasksTypesPieChart />
    </div>
  );
}

export default StatsContent;
