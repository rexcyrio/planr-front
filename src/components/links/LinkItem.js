import React from "react";
import PropTypes from "prop-types";
import styles from "./LinkItem.module.css";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Slide from "@mui/material/Slide";
import Tooltip from "@mui/material/Tooltip";

LinkItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    _toBeDeleted: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
  }).isRequired,
};

function LinkItem({ self }) {
  return (
    <Slide in={true} direction="right">
      <Tooltip
        followCursor={true}
        title={`Open ${self.name} in new tab`}
        PopperProps={{ sx: { padding: "0.5rem" } }}
      >
        <a
          className={styles["link-item"]}
          href={self.url}
          rel="noreferrer noopener"
          target="_blank"
        >
          <div className={styles["link-button"]}>
            <div className={styles["link-item-name"]}>{self.name}</div>
            <ArrowForwardIcon />
          </div>
        </a>
      </Tooltip>
    </Slide>
  );
}

export default React.memo(LinkItem);
