import React, { useEffect, useState } from "react";

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

const mappingDayToLeft = {
  1: "5.55rem", // Monday
  2: "11.5rem", // Tuesday
  3: "17.5rem", // Wednesday
  4: "23.5rem", // Thursday
  5: "29.5rem", // Friday
  6: "41.45rem", // Saturday
  0: "47.45rem", // Sunday
};

function getTop(hour, min) {
  // 2 hours = 5.55rem
  const sizeOfOneHour = 2.75;
  const base = -0.2;
  return `${base + hour * sizeOfOneHour + (min / 60) * sizeOfOneHour}rem`;
}

function LineMarker() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setDate(new Date());
    }, 1000 * 60 * 5); // every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: mappingDayToLeft[date.getDay()],
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
