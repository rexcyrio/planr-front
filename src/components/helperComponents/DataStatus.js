import React from "react";
import PropTypes from "prop-types";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import Tooltip from "@mui/material/Tooltip";

DataStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

function DataStatus({ status }) {
  switch (status) {
    case FETCHING:
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

    case UPDATING:
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

    case FETCH_SUCCESS:
    case UPDATE_SUCCESS:
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

    case FETCH_FAILURE:
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

    case UPDATE_FAILURE:
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

    default:
      throw Error("Invalid data status");
  }
}

export default React.memo(DataStatus);

export const FETCHING = "FETCHING";
export const FETCH_SUCCESS = "FETCH_SUCCESS";
export const FETCH_FAILURE = "FETCH_FAILURE";

export const UPDATING = "UPDATING";
export const UPDATE_SUCCESS = "UPDATE_SUCCESS";
export const UPDATE_FAILURE = "UPDATE_FAILURE";
