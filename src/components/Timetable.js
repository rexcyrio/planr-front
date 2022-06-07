import React from "react";
import styles from "./Timetable.module.css";

function Timetable() {
  const zeroPad = (num, places) => String(num).padStart(places, "0");

  function get30MinLater(time24H) {
    const [hour, min] = time24H.split(":");

    if (min === "00") {
      return `${hour}:30`;
    } else if (min === "30") {
      return `${zeroPad((Number(hour) + 1) % 24, 2)}:00`;
    }
  }

  function createRow(pair) {
    const [time24H, time24H_] = pair;

    return (
      <tr key={time24H}>
        <td>
          {time24H} - {time24H_}
        </td>
        <td className={styles["column"]}></td>
        <td className={styles["column"]}></td>
        <td className={styles["column"]}></td>
        <td className={styles["column"]}></td>
        <td className={styles["column"]}></td>
        <td>
          {time24H} - {time24H_}
        </td>
        <td className={styles["column"]}></td>
        <td className={styles["column"]}></td>
      </tr>
    );
  }

  function f(startTime24H, endTime24H) {
    const arr = [];
    let time = startTime24H;

    while (time !== endTime24H) {
      const time_ = get30MinLater(time);
      arr.push([time, time_]);
      time = time_;
    }

    return arr;
  }

  return (
    <div className={styles["container"]}>
      <div className={styles["sticky"]}>
        <table className={styles["header"]}>
          <thead>
            <tr>
              <th className={styles["column"]}></th>
              <th className={styles["column"]}>Monday</th>
              <th className={styles["column"]}>Tuesday</th>
              <th className={styles["column"]}>Wednesday</th>
              <th className={styles["column"]}>Thursday</th>
              <th className={styles["column"]}>Friday</th>
              <th className={styles["column"]}></th>
              <th className={styles["column"]}>Saturday</th>
              <th className={styles["column"]}>Sunday</th>
            </tr>
          </thead>
        </table>
      </div>

      <table className={styles["main"]}>
        <tbody>{f("08:00", "00:00").map((each) => createRow(each))}</tbody>
      </table>
    </div>
  );
}

export default Timetable;
