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
  return mappingDayToLeft_100[day];
}

const mappingDayToLeft_100 = {
  1: "-0.4375rem", // Monday
  2: "5.5rem", // Tuesday
  3: "11.5rem", // Wednesday
  4: "17.4375rem", // Thursday
  5: "23.4375rem", // Friday
  6: "29.4375rem", // Saturday
  0: "35.375rem", // Sunday
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
        height: "0",
        width: "0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",

          position: "relative",
          left: getLeft(date.getDay()),
          top: getTop(date.getHours(), date.getMinutes()),
          zIndex: "6",
          
          width: "fit-content",
          pointerEvents: "none",
        }}
      >
        <div style={circleStyle}></div>
        <div style={lineStyle}></div>
      </div>
    </div>
  );
}

export default React.memo(LineMarker);
