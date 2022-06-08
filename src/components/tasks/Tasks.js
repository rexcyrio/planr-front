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
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./Tasks.module.css";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [duration, setDuration] = useState("");
  const [moduleCode, setModuleCode] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTasks([
      {
        _id: uuidv4(),
        name: "Weekly assignment",
        dueDate: "2023-01-01",
        dueTime: "00:00",
        duration: "2",
        moduleCode: "CS3230",
      },
    ]);
  }, []);

  function resetState() {
    setName("");
    setDueDate(getDateNowString());
    setDueTime("23:59");
    setDuration("");
    setModuleCode("");
  }

  const handleClickOpen = () => {
    resetState();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function convert_24H_to_12H(str) {
    const [hour, min] = str.split(":");
    const int_hour = Number(hour);

    if (int_hour === 0) {
      return `12:${min}am`;
    }

    if (int_hour >= 1 && int_hour <= 11) {
      return `${str}am`;
    }

    return `${(int_hour - 12).toString()}:${min}pm`;
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

  function handleSubmit(e) {
    e.preventDefault();
    setOpen(false);

    const t = {
      _id: uuidv4(),
      name: name,
      dueDate: dueDate,
      dueTime: dueTime,
      duration: duration,
      moduleCode: moduleCode,
    };

    setTasks([...tasks, t]);
    resetState();
  }

  return (
    <>
      <h1>Tasks</h1>
      {tasks.length > 0 ? (
        tasks.map((each) => (
          <React.Fragment key={each._id}>
            <div className={styles["outer-container"]}>
              <div>
                <div>
                  <span className={styles["grey"]}>[{each.moduleCode}]</span>{" "}
                  {each.name} ({each.duration} hr)
                </div>

                <div>
                  <span className={styles["grey"]}>due on:</span> {each.dueDate}
                  @{convert_24H_to_12H(each.dueTime)}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))
      ) : (
        <div>There are no tasks.</div>
      )}
      <Fab
        color="primary"
        aria-label="add"
        style={{ position: "absolute", right: "1.5rem", bottom: "1rem" }}
        onClick={handleClickOpen}
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
              id="duration"
              label="Time needed"
              type="number"
              variant="outlined"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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

export default Tasks;

// <div>
//   <span className={styles["grey"]}>due on: </span>
//   {each.dueDate}
// </div>;
