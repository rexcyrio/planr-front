import React from "react";
import BarGraphSection from "./BarGraphSection";
import LineChartSection from "./LineChartSection";
import PieChartSection from "./PieChartSection";
import styles from "./StatsContent.module.css";
import Divider from "@mui/material/Divider";

function StatsContent() {
  return (
    <>
      <div className={styles.charts}>
        <div className={styles["bar-line-grouping"]}>
          <BarGraphSection />
          <Divider />
          <LineChartSection />
        </div>
        <div className={styles["pie-chart-div"]}>
          <PieChartSection />
        </div>
      </div>
    </>
  );
}

export default StatsContent;
