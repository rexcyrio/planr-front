import AddIcon from "@mui/icons-material/Add";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HelpIcon from "@mui/icons-material/Help";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function HelpWindow() {
  const [open, setOpen] = useState(false);
  const isNewUser = useSelector((state) => state.isNewUser);

  useEffect(() => {
    if (isNewUser) {
      setOpen(true);
    }
  }, [isNewUser]);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <>
      <Tooltip title="Help">
        <IconButton onClick={handleOpen}>
          <HelpIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Help</DialogTitle>

        <DialogContent>
          <DialogContentText>
            Open this help window anytime via the{" "}
            <InlineIcon>
              <HelpIcon fontSize="small" />{" "}
            </InlineIcon>
            icon at the top right hand corner.
          </DialogContentText>

          <h4>Timetable Scheduler</h4>
          <ol>
            <DialogContentText component="li" sx={{ margin: "0.75rem 0" }}>
              Import your{" "}
              <span style={{ color: "#ff5138", fontWeight: "bold" }}>
                NUSMods
              </span>{" "}
              timetable via the Settings icon{" "}
              <InlineIcon>
                <SettingsIcon fontSize="small" />{" "}
              </InlineIcon>
              at the top right hand corner.
            </DialogContentText>
            <DialogContentText component="li" sx={{ margin: "0.75rem 0" }}>
              Create tasks using the{" "}
              <InlineIcon>
                <AddIcon fontSize="small" />{" "}
              </InlineIcon>
              button at the bottom right corner.
            </DialogContentText>
            <DialogContentText component="li" sx={{ margin: "0.75rem 0" }}>
              Using the drag handle{" "}
              <InlineIcon>
                <DragIndicatorIcon fontSize="small" />
              </InlineIcon>
              , drag and drop tasks directly onto your timetable to schedule
              them.
            </DialogContentText>
          </ol>

          <h4>Lessons</h4>
          <ul>
            <DialogContentText component="li">
              Add a Zoom link to your lessons via the Details{" "}
              <InlineIcon>
                <InfoOutlinedIcon fontSize="small" />
              </InlineIcon>{" "}
              popup.
            </DialogContentText>
          </ul>

          <h4>Links</h4>
          <ul>
            <DialogContentText component="li">
              Links associated with today&apos;s tasks / lessons will
              automatically appear here.
            </DialogContentText>
          </ul>

          <h4>Notes</h4>
          <ul>
            <DialogContentText component="li">
              Double click on the note text to edit it.
            </DialogContentText>
          </ul>

          <h4>Statistics</h4>
          <ul>
            <DialogContentText component="li">
              Navigate to different weeks to view the stats for that week.
            </DialogContentText>
          </ul>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

InlineIcon.propTypes = {
  children: PropTypes.node.isRequired,
};

function InlineIcon(props) {
  return <span style={{ verticalAlign: "middle" }}>{props.children}</span>;
}

export default HelpWindow;
