import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTaskEditorPopupWarningOpen } from "../../store/slices/TaskEditorPopupSlice";
import { deleteTask, saveEditedTask } from "../../store/slices/tasksSlice";
import { selectModuleCodes } from "../../store/storeHelpers/selectors";
import TaskLinksCreator from "./TaskLinksCreator";

TaskEditor.propTypes = {
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

    isCompleted: PropTypes.bool.isRequired,
    mondayKey: PropTypes.array.isRequired,
  }).isRequired,
};

function TaskEditor({ self }) {
  const dispatch = useDispatch();
  const moduleCodes = useSelector(selectModuleCodes());

  const [name, setName] = useState(self.name);
  const [dueDate, setDueDate] = useState(self.dueDate);
  const [dueTime, setDueTime] = useState(self.dueTime);
  const [durationHours, setDurationHours] = useState(self.durationHours);
  const [moduleCode, setModuleCode] = useState(self.moduleCode);
  const [open, setOpen] = useState(false);
  const [taskLinks, setTaskLinks] = useState(self.links);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");

  const [durationState, setDurationState] = useState("NONE");
  const [urlState, setUrlState] = useState("NONE");

  function resetState() {
    setName(self.name);
    setDueDate(self.dueDate);
    setDueTime(self.dueTime);
    setDurationHours(self.durationHours);
    setModuleCode(self.moduleCode);
    setTaskLinks(self.links);
    setLinkName("");
    setLinkURL("");

    setDurationState("NONE");
    setUrlState("NONE");
  }

  function handleOpen() {
    resetState();
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleDurationHoursChange(event) {
    const newDuration = event.target.value;
    setDurationHours(newDuration);

    if (!newDuration.match(unsignedFloatRegex)) {
      setDurationState("ERROR");
      return;
    }

    if (Number(newDuration) > 24) {
      setDurationState("TOO_LARGE");
      return;
    }

    setDurationState("NONE");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (durationState !== "NONE") {
      return;
    }

    const newTask = {
      _id: self._id,

      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      durationHours: durationHours,
      moduleCode: moduleCode,
      links: taskLinks,

      row: self.row,
      col: self.col,
      timeUnits: Math.ceil(Number(durationHours) * 2),

      isCompleted: self.isCompleted,
      mondayKey: self.mondayKey,
    };

    dispatch(saveEditedTask(self, newTask, false, handleClose));
  }

  function continueFunction() {
    const newTask = {
      _id: self._id,

      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      durationHours: durationHours,
      moduleCode: moduleCode,
      links: taskLinks,

      row: self.row,
      col: self.col,
      timeUnits: Math.ceil(Number(durationHours) * 2),

      isCompleted: self.isCompleted,
      mondayKey: self.mondayKey,
    };

    dispatch(saveEditedTask(self, newTask, true, handleClose));
  }

  return (
    <>
      <Tooltip title="Edit">
        <IconButton size="small" onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Edit your Task</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <FormControl sx={{ width: "10rem", mr: "1rem" }} margin="dense">
              <InputLabel id="Module Code">Module Code</InputLabel>
              <Select
                labelId="Module Code"
                id="moduleCode"
                value={moduleCode}
                label="Module Code"
                onChange={(e) => setModuleCode(e.target.value)}
                required
              >
                {moduleCodes.map((moduleCode) => (
                  <MenuItem key={moduleCode} value={moduleCode}>
                    {moduleCode}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              sx={{ width: "25rem" }}
              margin="dense"
              id="name"
              label="Name"
              type="text"
              variant="outlined"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
            <br />
            <TextField
              sx={{ width: "15rem", mr: "1rem" }}
              margin="dense"
              id="durationHours"
              label="Time needed"
              type="text"
              variant="outlined"
              required
              value={durationHours}
              onChange={handleDurationHoursChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">hour(s)</InputAdornment>
                ),
              }}
              helperText={durationStates[durationState].helperText}
              error={durationStates[durationState].error}
            />
            {dueDate !== "--" && (
              <>
                <TextField
                  sx={{ mr: "1rem" }}
                  margin="dense"
                  id="dueDate"
                  label="Due date"
                  type="date"
                  variant="outlined"
                  required
                  value={dueDate}
                  placeholder=""
                  onChange={(e) => setDueDate(e.target.value)}
                  helperText=" "
                />
                <TextField
                  margin="dense"
                  id="dueTime"
                  label="Due time"
                  type="time"
                  variant="outlined"
                  required
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  helperText=" "
                />
              </>
            )}
            <TaskLinksCreator
              taskLinks={taskLinks}
              setTaskLinks={setTaskLinks}
              linkName={linkName}
              setLinkName={setLinkName}
              linkURL={linkURL}
              setLinkURL={setLinkURL}
              urlState={urlState}
              setUrlState={setUrlState}
            />
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between" }}>
            <Box sx={{ ml: "0.5rem" }}>
              <Button
                sx={{ color: "red" }}
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                  dispatch(deleteTask(self._id));
                }}
              >
                Delete
              </Button>
            </Box>
            <Box>
              <Button onClick={handleClose}>Discard Changes</Button>
              <Button type="submit">Save</Button>
            </Box>
          </DialogActions>
        </Box>

        <AutoUnscheduleSelfPopup continueFunction={continueFunction} />
      </Dialog>
    </>
  );
}

AutoUnscheduleSelfPopup.propTypes = {
  continueFunction: PropTypes.func.isRequired,
};

function AutoUnscheduleSelfPopup({ continueFunction }) {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.TaskEditorPopup.warningOpen);

  function handleCancel() {
    dispatch(setTaskEditorPopupWarningOpen(false));
  }

  function handleContinue() {
    continueFunction();
  }

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Failed to extend task duration</DialogTitle>
      <DialogContent>
        <DialogContentText>
          If this task&apos;s duration was extended, it would either:
        </DialogContentText>
        <ul>
          <li>
            <DialogContentText>
              clash with other module lessons / scheduled tasks below it; or
            </DialogContentText>
          </li>
          <li>
            <DialogContentText>exceed the timetable.</DialogContentText>
          </li>
        </ul>
        <br />
        <DialogContentText>
          If you choose to continue, your changes will be saved and this task
          will be <strong>automatically unscheduled</strong>.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="contained">
          Cancel
        </Button>
        <Button onClick={handleContinue}>Continue</Button>
      </DialogActions>
    </Dialog>
  );
}

const durationStates = {
  NONE: {
    helperText: " ",
    error: false,
  },
  ERROR: {
    helperText: "Please enter a valid duration",
    error: true,
  },
  TOO_LARGE: {
    helperText: "Largest valid value is 24 hours",
    error: true,
  },
};

// matches
// 1
// 99
// 0.1
// 0.99
// 99.01

// DOES NOT match
// 0
// 0000
// 0.0
// 0000.0
// 0.0000
// 0000.0000
// 1e1
// -0.1
// +0.1
// .1
// 00.01
const unsignedFloatRegex =
  /(^0\.\d*[1-9]\d*$)|(^[1-9]\d*\.\d+$)|(^[1-9]\d*$)/gm;

export default TaskEditor;
