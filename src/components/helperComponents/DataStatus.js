import React from "react";
import PropTypes from "prop-types";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import Tooltip from "@mui/material/Tooltip";

function DataStatus({ status }) {
  DataStatus.propTypes = {
    status: PropTypes.string,
  };

  switch (status) {
    case "IN_SYNC":
      return (
        <Tooltip title="In sync with database">
          <CloudDoneIcon
            color="success"
            sx={{
              padding: "8px",
            }}
          />
        </Tooltip>
      );

    case "UPDATING":
      return (
        <Tooltip title="Updating Database">
          <CircularProgress
            size={24}
            sx={{
              padding: "8px",
            }}
          />
        </Tooltip>
      );

    case "INITIAL_LOAD":
      return (
        <Tooltip title="Loading from Database">
          <PendingIcon
            color="info"
            sx={{
              padding: "8px",
            }}
          />
        </Tooltip>
      );

    case "OUT_OF_SYNC":
      return (
        <Tooltip title="Database sync failed">
          <ErrorIcon
            color="error"
            sx={{
              padding: "8px",
            }}
          />
        </Tooltip>
      );

    default: //LOAD_FAILED
      return (
        <Tooltip title="Database load failed">
          <ErrorIcon
            color="error"
            sx={{
              padding: "8px",
            }}
          />
        </Tooltip>
      );
  }
}

export default DataStatus;
