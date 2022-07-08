import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addTask } from "../../store/slices/tasksSlice";
import TaskLinksCreator from "./TaskLinksCreator";

function TaskCreator() {
  const dispatch = useDispatch();
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const moduleCodes = useSelector((state) =>
    Object.keys(state.mappingModuleCodeToColourName)
  );

  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(getDateNowString());
  const [dueTime, setDueTime] = useState("23:59");
  const [durationHours, setDurationHours] = useState("");
  const [moduleCode, setModuleCode] = useState("Others");
  const [open, setOpen] = useState(false);
  const [taskLinks, setTaskLinks] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");

  const [durationState, setDurationState] = useState("NONE");
  const [urlState, setUrlState] = useState("NONE");

  function resetState() {
    setName("");
    setDueDate(getDateNowString());
    setDueTime("23:59");
    setDurationHours("");
    setModuleCode("Others");
    setTaskLinks([]);
    setLinkName("");
    setLinkURL("");

    setDurationState("NONE");
    setUrlState("NONE");
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetState();
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

    setOpen(false);

    const newTask = {
      _id: uuidv4(),

      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      durationHours: durationHours,
      moduleCode: moduleCode,
      links: taskLinks,

      row: -1,
      col: -1,
      timeUnits: Math.ceil(Number(durationHours) * 2),

      isCompleted: false,
      mondayKey: mondayKey,
    };

    dispatch(addTask(newTask));
    resetState();
  }

  return (
    <>
      <Fab
        color="primary"
        aria-label="add"
        style={{ position: "absolute", right: "1.5rem", bottom: "1rem" }}
        onClick={handleOpen}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Add a new Task</DialogTitle>
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
            <TextField
              sx={{ mr: "1rem" }}
              margin="dense"
              id="dueDate"
              label="Due date"
              type="date"
              variant="outlined"
              required
              value={dueDate}
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
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

function getDateNowString() {
  const date = new Date();

  const y = date.getFullYear().toString();
  // converting from 0-based indexing to 1-based indexing
  const m = (date.getMonth() + 1).toString();
  const d = date.getDate().toString();

  const m2 = m.length === 2 ? m : "0" + m;
  const d2 = d.length === 2 ? d : "0" + d;

  return `${y}-${m2}-${d2}`;
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

export default TaskCreator;
