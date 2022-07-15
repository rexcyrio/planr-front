import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  importNUSModsTimetable,
  resetNUSModsURLStatus
} from "../../store/slices/NUSModsURLSlice";

function ImportNUSModsTimetable() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.NUSModsURL.status);
  const [NUSModsURL, setNUSModsURL] = useState(
    useSelector((state) => state.NUSModsURL.url)
  );
  const [isValidNUSModsURL, setIsValidNUSModsURL] = useState(true);

  function handleSubmit(event) {
    event.preventDefault();

    if (NUSModsURL.indexOf("nusmods.com/timetable/") === -1) {
      setIsValidNUSModsURL(false);
    } else {
      setIsValidNUSModsURL(true);
      dispatch(importNUSModsTimetable(NUSModsURL, false));
    }
  }

  function handleChange(event) {
    setIsValidNUSModsURL(true);
    setNUSModsURL(event.target.value);

    if (status !== "NONE") {
      dispatch(resetNUSModsURLStatus());
    }
  }

  return (
    <>
      <h4>Import NUSMods Timetable</h4>

      <Alert severity="warning">
        When importing a new NUSMods timetable, tasks that were associated with
        old modules will be converted to &quot;Others&quot; automatically.
      </Alert>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          id="NUSModsURL"
          type="url"
          variant="outlined"
          value={NUSModsURL}
          label="NUSMods URL"
          fullWidth
          required
          onChange={handleChange}
          helperText={isValidNUSModsURL ? " " : "Invalid NUSMods URL"}
          error={!isValidNUSModsURL}
          placeholder="e.g. https://nusmods.com/timetable/sem-1/share?..."
          sx={{ mt: "1.5rem" }}
        />
        <br />
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button type="submit" variant="contained" sx={{ m: "1rem 0" }}>
            Import Timetable
          </Button>
          {mappingStatusToIcon[status]}
        </div>
      </Box>

      <WarningPopup NUSModsURL={NUSModsURL} />
    </>
  );
}

WarningPopup.propTypes = {
  NUSModsURL: PropTypes.string.isRequired,
};

function WarningPopup({ NUSModsURL }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const status = useSelector((state) => state.NUSModsURL.status);

  useEffect(() => {
    if (status === "WARNING") {
      setOpen(true);
    }
  }, [status]);

  function handleCancel() {
    setOpen(false);
  }

  function handleContinue() {
    dispatch(importNUSModsTimetable(NUSModsURL, true));
    setOpen(false);
  }

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>Timetable clash detected!</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The NUSMods timetable that you&apos;re trying to import clashes with
          other scheduled tasks.
          <br />
          <br />
          If you choose to continue, the tasks that clash with the incoming
          NUSMods timetable will be automatically unscheduled.
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

const mappingStatusToIcon = {
  NONE: <></>,
  FETCHING: (
    <Tooltip title="Importing timetable...">
      <CircularProgress
        size="1.5rem"
        sx={{
          ml: "1rem",
        }}
      />
    </Tooltip>
  ),
  FETCH_SUCCESS: (
    <Tooltip title="Timetable successfully imported">
      <DoneIcon
        sx={{
          ml: "1rem",
          color: "grey",
        }}
      />
    </Tooltip>
  ),
  FETCH_FAILURE: (
    <Tooltip title="Failed to import timetable">
      <ErrorIcon
        sx={{
          ml: "1rem",
          color: "#cc0000",
        }}
      />
    </Tooltip>
  ),
  WARNING: (
    <Tooltip title="Timetable clash detected!">
      <WarningIcon
        sx={{
          ml: "1rem",
          color: "#ffcc00",
        }}
      />
    </Tooltip>
  ),
};

export default ImportNUSModsTimetable;
