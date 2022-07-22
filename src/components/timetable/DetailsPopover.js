import DoneIcon from "@mui/icons-material/Done";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  markTaskAsComplete,
  markTaskAsIncomplete,
} from "../../store/slices/tasksSlice";
import ModuleLinksManager from "../links/ModuleLinksManager";
import TaskEditor from "../tasks/TaskEditor";
import styles from "./TimetableCell.module.css";

DetailsPopover.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,

    name: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    dueTime: PropTypes.string.isRequired,
    durationHours: PropTypes.string.isRequired,
    moduleCode: PropTypes.string.isRequired,
    links: PropTypes.array.isRequired,

    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    timeUnits: PropTypes.number.isRequired,

    isCompleted: PropTypes.objectOf(PropTypes.bool).isRequired,
    mondayKey: PropTypes.array.isRequired,
  }).isRequired,
};

function DetailsPopover({ self }) {
  const dispatch = useDispatch();
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    setOpen(false);
  }, []);

  const detailsIcon = useMemo(
    () => (
      <Tooltip title="View details">
        <IconButton
          aria-label="details"
          size="small"
          onClick={handleClick}
          sx={{
            fontSize: "1rem",
            p: "0.125rem",
          }}
        >
          <InfoOutlinedIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    ),
    [handleClick]
  );

  const markTaskAsIncompleteButton = useMemo(
    () => (
      <Tooltip title="Restore task">
        <IconButton
          size="small"
          onClick={() => dispatch(markTaskAsIncomplete(self._id))}
        >
          <RestoreIcon />
        </IconButton>
      </Tooltip>
    ),
    [dispatch, self._id]
  );

  const markTaskAsCompleteButton = useMemo(
    () => (
      <Tooltip title="Mark task as complete">
        <IconButton
          size="small"
          onClick={() => dispatch(markTaskAsComplete(self._id))}
        >
          <DoneIcon />
        </IconButton>
      </Tooltip>
    ),
    [dispatch, self._id]
  );

  return (
    <>
      {detailsIcon}

      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={handleClose}
      >
        <Box
          sx={{
            border: 1,
            borderRadius: "5px",
            p: 1,
            bgcolor: "background.paper",
            maxWidth: "16rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontWeight: "bold" }}>{self.moduleCode}</div>
            <div>
              {isModuleItem(self) ? (
                <ModuleLinksManager self={self} />
              ) : (
                <>
                  <TaskEditor self={self} />
                  {self.isCompleted[mondayKey] !== undefined
                    ? markTaskAsIncompleteButton
                    : markTaskAsCompleteButton}
                </>
              )}
            </div>
          </div>

          <p className={styles["task-name-paragraph"]}>{self.name}</p>

          {!isModuleItem(self) && (
            <p>
              Due on: {self.dueDate} at {self.dueTime}
            </p>
          )}

          <p>Duration: {self.durationHours} hour(s)</p>

          {!isModuleItem(self) && (
            <p>
              Status:{" "}
              {self.isCompleted[mondayKey] !== undefined
                ? "Completed"
                : "Not Completed"}
            </p>
          )}

          {self.links.map((link) => (
            <React.Fragment key={link._id}>
              <a
                href={link.url}
                rel="noreferrer noopener"
                target="_blank"
                style={{
                  display: "block",
                  maxWidth: "12rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {link.name}
              </a>
              <br />
            </React.Fragment>
          ))}
        </Box>
      </Popover>
    </>
  );
}

function isModuleItem(self) {
  return self._id.slice(0, 2) === "__";
}

export default React.memo(DetailsPopover);
