import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import WarningIcon from "@mui/icons-material/Warning";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  importNUSModsTimetable,
  removeNUSModsTimetable,
  resetNUSModsURLStatus,
} from "../../store/slices/NUSModsURLSlice";
import NUSMods_M_only from "./../../icons/logo NUSMods M only.svg";
import NUSModsTimetableAutoUnschedulePopup from "./NUSModsTimetableAutoUnschedulePopup";
import NUSModsTimetableOverlappingLessonsPopup from "./NUSModsTimetableOverlappingLessonsPopup";

function ImportNUSModsTimetable() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.NUSModsURL.status);
  const reduxNUSModsURL = useSelector((state) => state.NUSModsURL.url);
  const [open, setOpen] = useState(false);
  const [NUSModsURL, setNUSModsURL] = useState("");
  const [isValidNUSModsURL, setIsValidNUSModsURL] = useState(true);

  const handleOpen = useCallback(() => {
    dispatch(resetNUSModsURLStatus());
    setNUSModsURL(reduxNUSModsURL);
    setOpen(true);
  }, [dispatch, reduxNUSModsURL]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (NUSModsURL.indexOf("nusmods.com/timetable/") === -1) {
        setIsValidNUSModsURL(false);
      } else {
        setIsValidNUSModsURL(true);
        dispatch(importNUSModsTimetable(NUSModsURL, false));
      }
    },
    [dispatch, NUSModsURL]
  );

  const handleURLChange = useCallback(
    (event) => {
      setIsValidNUSModsURL(true);
      setNUSModsURL(event.target.value);
      dispatch(resetNUSModsURLStatus());
    },
    [dispatch]
  );

  // ==========================================================================
  // Memoised React components
  // ==========================================================================

  const tooltipButton = useMemo(
    () => (
      <Tooltip title="Import NUSMods Timetable">
        <IconButton onClick={handleOpen}>
          <img
            src={NUSMods_M_only}
            alt="Import NUSMods timetable"
            style={{ height: "1.5rem", width: "1.5rem" }}
          />
        </IconButton>
      </Tooltip>
    ),
    [handleOpen]
  );

  const dialogTitle = useMemo(
    () => (
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>Import NUSMods Timetable</div>
        <MoreMenu />
      </DialogTitle>
    ),
    []
  );

  const alertMessages = useMemo(
    () => (
      <>
        <Alert severity="info" sx={{ marginBottom: "0.5rem" }}>
          The timetable link generated by <b>NUSMods</b> will include both
          &quot;visible&quot; and &quot;hidden&quot; modules. As there is no way
          to distinguish them when parsing / importing the <b>NUSMods</b> URL,
          they will all be imported into PlanR.
          <br />
          <br />
          To avoid this situation, please remove all &quot;hidden&quot; modules
          before importing.
        </Alert>

        <Alert severity="warning" sx={{ marginBottom: "1rem" }}>
          When importing a new <b>NUSMods</b> timetable, tasks that are
          associated with old module codes will be converted to
          &quot;Others&quot; automatically.
        </Alert>
      </>
    ),
    []
  );

  const urlTextField = useMemo(
    () => (
      <TextField
        id="NUSModsURL"
        type="url"
        variant="outlined"
        value={NUSModsURL}
        label="NUSMods URL"
        fullWidth
        required
        onChange={handleURLChange}
        helperText={isValidNUSModsURL ? " " : "Invalid NUSMods URL"}
        error={!isValidNUSModsURL}
        placeholder="e.g. https://nusmods.com/timetable/sem-1/share?..."
        margin="dense"
      />
    ),
    [NUSModsURL, isValidNUSModsURL, handleURLChange]
  );

  const submitButton = useMemo(
    () => (
      <Button type="submit" variant="contained">
        Import Timetable
      </Button>
    ),
    []
  );

  const dialogActions = useMemo(
    () => (
      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    ),
    [handleClose]
  );

  return (
    <>
      {tooltipButton}

      <Dialog open={open} onClose={handleClose}>
        {dialogTitle}

        <DialogContent>
          {alertMessages}

          <form onSubmit={handleSubmit}>
            {urlTextField}
            <br />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: "1rem",
              }}
            >
              {submitButton}
              {mappingStatusToIcon[status]}
            </div>
          </form>
        </DialogContent>

        {dialogActions}
      </Dialog>

      <NUSModsTimetableAutoUnschedulePopup NUSModsURL={NUSModsURL} />
      <NUSModsTimetableOverlappingLessonsPopup />
    </>
  );
}

function MoreMenu() {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const openPopover = Boolean(anchorEl);

  const handleOpenMenu = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);

  return (
    <>
      <Tooltip title="More">
        <IconButton id="menu-button" onClick={handleOpenMenu}>
          <MoreVertIcon />
        </IconButton>
      </Tooltip>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={openPopover}
        onClose={handleCloseMenu}
        MenuListProps={{
          "aria-labelledby": "menu-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenDialog();
          }}
        >
          <ListItemIcon>
            <DeleteForeverIcon sx={{ color: "#b50000" }} />
          </ListItemIcon>

          <ListItemText sx={{ color: "#b50000" }}>
            Remove NUSMods Timetable
          </ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Remove NUSMods Timetable?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            All of the following will be removed:
          </DialogContentText>
          <ul>
            <DialogContentText component="li">
              NUSMods lessons in the timetable
            </DialogContentText>
            <DialogContentText component="li">
              Links associated with NUSMods lessons
            </DialogContentText>
            <DialogContentText component="li">
              Automatically created Tutorial tasks
            </DialogContentText>
          </ul>

          <DialogContentText>
            All remaining tasks will be converted to &quot;Others&quot;
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} variant="contained">
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleCloseDialog();
              dispatch(removeNUSModsTimetable());
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
  AUTO_UNSCHEDULE_WARNING: (
    <Tooltip title="Timetable clash detected!">
      <WarningIcon
        sx={{
          ml: "1rem",
          color: "#ffcc00",
        }}
      />
    </Tooltip>
  ),
  OVERLAPPING_LESSONS_ERROR: (
    // same as FETCH_FAILURE
    <Tooltip title="Failed to import timetable">
      <ErrorIcon
        sx={{
          ml: "1rem",
          color: "#cc0000",
        }}
      />
    </Tooltip>
  ),
};

export default ImportNUSModsTimetable;
