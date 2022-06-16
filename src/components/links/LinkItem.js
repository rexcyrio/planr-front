import React from "react";
import PropTypes from "prop-types";
import styles from "./LinkItem.module.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

LinkItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string,
    _toBeDeleted: PropTypes.bool,
    _name: PropTypes.string,
    _url: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string,
  }),
};

function LinkItem({ self }) {
  return (
    <a href={self.url} rel="noreferrer noopener" target="_blank">
      <div className={styles["links-button"]}>
        <div>{self.name}</div>
        <ArrowForwardIcon />
      </div>
    </a>
  );
}

export default LinkItem;
