import React from "react";
import BarGraphSection from "./BarGraphSection";
import PieChartSection from "./PieChartSection";
import styles from "./StatsContent.module.css";

function StatsContent() {
  return (
    <div className={styles.charts}>
      <BarGraphSection />
      <PieChartSection />
    </div>
  );
}

export default StatsContent;
