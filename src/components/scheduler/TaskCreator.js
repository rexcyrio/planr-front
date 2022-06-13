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
import PropTypes from "prop-types";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

TaskCreator.propTypes = {
  addTask: PropTypes.func,

  // TODO: both of the following props are currently unused
  updateTask: PropTypes.func,
  deleteTask: PropTypes.func,
};

function TaskCreator({ addTask }) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(getDateNowString());
  const [dueTime, setDueTime] = useState("23:59");
  const [durationHours, setDurationHours] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [open, setOpen] = useState(false);

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

  function resetState() {
    setName("");
    setDueDate(getDateNowString());
    setDueTime("23:59");
    setDurationHours("");
    setModuleCode("");
  }

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    resetState();
  }

  function handleSubmit(event) {
    event.preventDefault();
    setOpen(false);

    const newTask = {
      _id: uuidv4(),
      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      durationHours: durationHours,
      timeUnits: Number(durationHours) * 2,
      moduleCode: moduleCode,
    };

    addTask(newTask);
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
                {/* TODO: update module codes */}
                <MenuItem value={"CS1101S"}>CS1101S</MenuItem>
                <MenuItem value={"CS1231S"}>CS1231S</MenuItem>
                <MenuItem value={"MA1521"}>MA1521</MenuItem>
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
              type="number"
              variant="outlined"
              required
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">hour(s)</InputAdornment>
                ),
              }}
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

export default TaskCreator;
