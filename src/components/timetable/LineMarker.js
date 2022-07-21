import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";

const circleStyle = {
  height: "0.5rem",
  width: "0.5rem",
  borderRadius: "50%",
  backgroundColor: "red",
  position: "relative",
  left: "0.25rem",
};

const lineStyle = {
  height: "0.1rem",
  width: "5.95rem",
  backgroundColor: "red",
};

function getLeft(day) {
  const devicePixelRatio = window.devicePixelRatio;

  if (devicePixelRatio <= 1) {
    return mappingDayToLeft_100[day];
  } else if (devicePixelRatio <= 1.25) {
    return mappingDayToLeft_125[day];
  } else if (devicePixelRatio <= 1.5) {
    return mappingDayToLeft_150[day];
  } else {
    return mappingDayToLeft_150[day];
  }
}

const mappingDayToLeft_100 = {
  1: "5.5625rem", // Monday
  2: "11.5rem", // Tuesday
  3: "17.5rem", // Wednesday
  4: "23.5rem", // Thursday
  5: "29.5rem", // Friday
  6: "35.5rem", // Saturday
  0: "41.4375rem", // Sunday
};

const mappingDayToLeft_125 = {
  1: "5.5rem", // Monday
  2: "11.5rem", // Tuesday
  3: "17.4375rem", // Wednesday
  4: "23.4375rem", // Thursday
  5: "29.375rem", // Friday
  6: "35.375rem", // Saturday
  0: "41.34375rem", // Sunday
};

const mappingDayToLeft_150 = {
  1: "5.46875rem", // Monday
  2: "11.46875rem", // Tuesday
  3: "17.4375rem", // Wednesday
  4: "23.375rem", // Thursday
  5: "29.34375rem", // Friday
  6: "35.3125rem", // Saturday
  0: "41.3125rem", // Sunday
};

function getTop(hour, min) {
  // 2 hours = 5.55rem
  const sizeOfOneHour = 2.75;
  const base = -0.2;
  return `${base + hour * sizeOfOneHour + (min / 60) * sizeOfOneHour}rem`;
}

function LineMarker() {
  const [date, setDate] = useState(new Date());
  const mondayKey = useSelector((state) => state.time.mondayKey);

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60 * 5); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  if (!isCurrentWeek(mondayKey)) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: getLeft(date.getDay()),
        top: getTop(date.getHours(), date.getMinutes()),
        zIndex: "6",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={circleStyle}></div>
        <div style={lineStyle}></div>
      </div>
    </div>
  );
}

export default LineMarker;
