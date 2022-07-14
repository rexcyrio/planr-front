import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  goToNextWeek,
  goToPreviousWeek,
  goToToday,
} from "../../store/slices/timeSlice";

function TimetableNavigator() {
  const dispatch = useDispatch();
  const mondayKey = useSelector((state) => state.time.mondayKey);

  return (
    <div style={{ position: "relative" }}>
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.5rem 0",
        }}
      >
        <Tooltip
          title="Previous week"
          placement="left"
          onClick={() => dispatch(goToPreviousWeek())}
        >
          <IconButton size="small">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>

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

        <Tooltip
          title="Next week"
          placement="right"
          onClick={() => dispatch(goToNextWeek())}
        >
          <IconButton size="small">
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

function getWeekRange(mondayKey) {
  const [dateNumber, monthNumber, yearNumber] = mondayKey;

  const monday = new Date(yearNumber, monthNumber, dateNumber);
  const sunday = new Date(yearNumber, monthNumber, dateNumber + 6);
  return `${convertToDateString(monday)} - ${convertToDateString(sunday)}`;
}

function convertToDateString(dateObject) {
  // "Wed Jul 28 1993"
  const str = dateObject.toDateString();

  // ["Jul", "28", "1993"]
  const [shortMonthName, date, year] = str.split(" ").slice(1);

  return `${date} ${shortMonthName} ${year}`;
}

export default TimetableNavigator;