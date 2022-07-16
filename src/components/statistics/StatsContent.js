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
        <BarGraphSection />
        <Divider />
        <LineChartSection />
        <Divider />
        <PieChartSection />
      </div>
    </>
  );
}

export default StatsContent;
