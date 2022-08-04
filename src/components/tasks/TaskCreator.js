import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addTask } from "../../store/slices/tasksSlice";
import { selectTags } from "../../store/storeHelpers/selectors";
import TaskLinksCreator from "./TaskLinksCreator";

function TaskCreator() {
  const dispatch = useDispatch();
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const tags = useSelector((state) => selectTags(state));

  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(getDateNowString());
  const [dueTime, setDueTime] = useState("23:59");
  const [durationHours, setDurationHours] = useState("");
  const [tag, setTag] = useState("Others");
  const [open, setOpen] = useState(false);
  const [taskLinks, setTaskLinks] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [numCopies, setNumCopies] = useState(1);

  const [durationState, setDurationState] = useState("NONE");
  const [urlState, setUrlState] = useState("NONE");
  const [numCopiesState, setNumCopiesState] = useState("NONE");

  function resetState() {
    setName("");
    setDueDate(getDateNowString());
    setDueTime("23:59");
    setDurationHours("");
    setTag("Others");
    setTaskLinks([]);
    setLinkName("");
    setLinkURL("");
    setIsRecurring(false);
    setNumCopies(1);

    setDurationState("NONE");
    setUrlState("NONE");
    setNumCopiesState("NONE");
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (durationState !== "NONE" || numCopiesState !== "NONE") {
      return;
    }

    setOpen(false);

    const newTask = {
      _id: uuidv4(),

      name: name,
      dueDate: isRecurring ? "--" : dueDate,
      dueTime: isRecurring ? "--" : dueTime,
      durationHours: durationHours,
      tag: tag,
      links: taskLinks,

      row: -1,
      col: -1,
      timeUnits: Math.ceil(Number(durationHours) * 2),

      isCompleted: {},
      mondayKey: isRecurring ? [] : mondayKey,
    };

    dispatch(addTask(newTask));

    if (numCopies === 1) {
      return;
    }

    // need to assign new uuid for both the task item and its associated task links
    for (let i = 1; i < numCopies; i++) {
      // deep copying task links
      const taskLinksCopy = [];

      for (const link of newTask.links) {
        taskLinksCopy.push({
          ...link,
          _id: uuidv4(),
        });
      }

      const newTaskCopy = {
        ...newTask,
        _id: uuidv4(),
        links: taskLinksCopy,
      };

      dispatch(addTask(newTaskCopy));
    }
  }

  // ============================================================================
  // Memo functions
  // ============================================================================

  const handleOpen = useCallback(() => {
    resetState();
    setOpen(true);
  }, []);

  const handleDurationHoursChange = useCallback((event) => {
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
  }, []);

  const handleCountChange = useCallback((event) => {
    const newCount = event.target.value;
    setNumCopies(newCount);

    if (!newCount.match(positiveIntegerRegex)) {
      setNumCopiesState("ERROR");
      return;
    }

    if (Number(newCount) > 10) {
      setNumCopiesState("TOO_LARGE");
      return;
    }

    setNumCopiesState("NONE");
  }, []);

  // ============================================================================
  // Memo components
  // ============================================================================

  const fab = useMemo(
    () => (
      <Fab
        color="primary"
        aria-label="add"
        style={{ position: "absolute", right: "1.5rem", bottom: "1rem" }}
        onClick={handleOpen}
      >
        <AddIcon />
      </Fab>
    ),
    [handleOpen]
  );

  const dialogTitle = useMemo(
    () => (
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <div>Add a new Task</div>
        <FormControlLabel
          control={
            <Switch
              onChange={(event) => setIsRecurring(event.target.checked)}
            />
          }
          label="Recurring"
        />
      </DialogTitle>
    ),
    []
  );

  const taskTagSelector = useMemo(
    () => (
      <FormControl sx={{ width: "10rem", mr: "1rem" }} margin="dense">
        <InputLabel id="Tag">Tag</InputLabel>
        <Select
          labelId="Tag"
          id="tag"
          value={tag}
          label="Tag"
          onChange={(e) => setTag(e.target.value)}
          required
        >
          {tags.map((_tag) => (
            <MenuItem key={_tag} value={_tag}>
              {_tag}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    ),
    [tag, tags]
  );

  const taskNameTextField = useMemo(
    () => (
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
    ),
    [name]
  );

  const taskDurationTextField = useMemo(
    () => (
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
          endAdornment: <InputAdornment position="end">hour(s)</InputAdornment>,
        }}
        helperText={durationStates[durationState].helperText}
        error={durationStates[durationState].error}
      />
    ),
    [durationHours, handleDurationHoursChange, durationState]
  );

  const taskDueDateTextField = useMemo(
    () => (
      <TextField
        sx={{ width: "10.75rem", mr: "1rem" }}
        margin="dense"
        id="dueDate"
        label="Due date"
        type="date"
        variant="outlined"
        required={!isRecurring}
        disabled={isRecurring}
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        helperText=" "
      />
    ),
    [isRecurring, dueDate]
  );

  const taskDueTimeTextField = useMemo(
    () => (
      <TextField
        sx={{ width: "8.25rem" }}
        margin="dense"
        id="dueTime"
        label="Due time"
        type="time"
        variant="outlined"
        required={!isRecurring}
        disabled={isRecurring}
        value={dueTime}
        onChange={(e) => setDueTime(e.target.value)}
        helperText=" "
      />
    ),
    [isRecurring, dueTime]
  );

  const taskNumCopiesTextField = useMemo(
    () => (
      <TextField
        fullWidth
        margin="dense"
        id="numCopies"
        label="Number of copies"
        type="text"
        variant="outlined"
        required
        value={numCopies}
        onChange={handleCountChange}
        helperText={numCopiesStates[numCopiesState].helperText}
        error={numCopiesStates[numCopiesState].error}
      />
    ),
    [numCopies, handleCountChange, numCopiesState]
  );

  const dialogActions = useMemo(
    () => (
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit">Add</Button>
      </DialogActions>
    ),
    []
  );

  return (
    <>
      {fab}
      
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        {dialogTitle}
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            {taskTagSelector}
            {taskNameTextField}
            <br />
            {taskDurationTextField}
            {taskDueDateTextField}
            {taskDueTimeTextField}
            <br />
            {taskNumCopiesTextField}
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
          {dialogActions}
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

const numCopiesStates = {
  NONE: {
    helperText: " ",
    error: false,
  },
  ERROR: {
    helperText: "Please enter a valid quantity",
    error: true,
  },
  TOO_LARGE: {
    helperText: "Largest valid value is 10",
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

const positiveIntegerRegex = /^[1-9]\d*$/;

export default React.memo(TaskCreator);
