import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
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

TaskEditor.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,

    name: PropTypes.string.isRequired,
    dueDate: PropTypes.string.isRequired,
    dueTime: PropTypes.string.isRequired,
    durationHours: PropTypes.string.isRequired,
    moduleCode: PropTypes.string.isRequired,

    row: PropTypes.number.isRequired,
    col: PropTypes.number.isRequired,
    timeUnits: PropTypes.number.isRequired,

    isCompleted: PropTypes.bool.isRequired,
  }).isRequired,

  _setMatrix: PropTypes.func.isRequired,
  _setTask: PropTypes.func.isRequired,
  matrix: PropTypes.array.isRequired,
  deleteTask: PropTypes.func.isRequired,
};

function TaskEditor({ self, _setMatrix, _setTask, matrix, deleteTask }) {
  const [name, setName] = useState(self.name);
  const [dueDate, setDueDate] = useState(self.dueDate);
  const [dueTime, setDueTime] = useState(self.dueTime);
  const [durationHours, setDurationHours] = useState(self.durationHours);
  const [moduleCode, setModuleCode] = useState(self.moduleCode);
  const [open, setOpen] = useState(false);

  function resetState() {
    setName(self.name);
    setDueDate(self.dueDate);
    setDueTime(self.dueTime);
    setDurationHours(self.durationHours);
    setModuleCode(self.moduleCode);
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
      _id: self._id,

      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      durationHours: durationHours,
      moduleCode: moduleCode,

      row: self.row,
      col: self.col,
      timeUnits: Math.ceil(Number(durationHours) * 2),

      isCompleted: self.isCompleted,
    };

    // updating matrix
    if (newTask.timeUnits < self.timeUnits) {
      // case 1: user shortened time needed for task
      const diff = self.timeUnits - newTask.timeUnits;

      for (let i = 0; i < diff; i++) {
        _setMatrix(self.row + i, self.col, "0");
      }
    } else if (newTask.timeUnits === self.timeUnits) {
      // do nothing
    } else if (newTask.timeUnits > self.timeUnits) {
      // check whether there is enough available time units to expand
      // case 2: user lengthened time needed for task, enough available time units
      // case 3: user lengthened time needed for task, NOT enough available time units
    }

    // updating tasks array
    _setTask(self._id, newTask);

    // no need to call `resetState()` here since the fields already represent
    // the correct information even on immediate reopen
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
          <DialogActions sx={{ justifyContent: "space-between" }}>
            <Box sx={{ ml: "0.5rem" }}>
              <Button
                sx={{ color: "red" }}
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                  deleteTask(self);
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
      </Dialog>
    </>
  );
}

export default TaskEditor;
