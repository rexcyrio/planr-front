import PropTypes from "prop-types";
import React from "react";
import styles from "./Timetable.module.css";

TimetableBackgroundCell.propTypes = {
  backgroundColor: PropTypes.string.isRequired,
};

function TimetableBackgroundCell({ backgroundColor }) {
  return (
    <td className={styles["cell"]} style={{ backgroundColor: backgroundColor }}>
      &nbsp;
    </td>
  );
}

export default React.memo(TimetableBackgroundCell);
