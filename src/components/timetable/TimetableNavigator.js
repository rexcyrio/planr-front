import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import getWeekRange from "../../helper/getWeekRangeHelper";
import {
  goToNextWeek,
  goToPreviousWeek,
  goToToday,
} from "../../store/slices/timeSlice";

function TimetableNavigator() {
  const dispatch = useDispatch();
  const mondayKey = useSelector((state) => state.time.mondayKey);

  const todayButton = useMemo(
    () => (
      <Button
        variant="outlined"
        size="small"
        sx={{
          position: "absolute",
          top: "0.5rem",
          left: "0",
        }}
        onClick={() => dispatch(goToToday())}
      >
        Today
      </Button>
    ),
    [dispatch]
  );

  const previousWeekButton = useMemo(
    () => (
      <Tooltip
        title="Previous week"
        placement="left"
        onClick={() => dispatch(goToPreviousWeek())}
      >
        <IconButton size="small">
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    [dispatch]
  );

  const nextWeekButton = useMemo(
    () => (
      <Tooltip
        title="Next week"
        placement="right"
        onClick={() => dispatch(goToNextWeek())}
      >
        <IconButton size="small">
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    ),
    [dispatch]
  );

  return (
    <div style={{ position: "relative" }}>
      {todayButton}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem 0",
        }}
      >
        {previousWeekButton}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "14rem",
          }}
        >
          {getWeekRange(mondayKey)}
        </div>

        {nextWeekButton}
      </div>
    </div>
  );
}

export default TimetableNavigator;
