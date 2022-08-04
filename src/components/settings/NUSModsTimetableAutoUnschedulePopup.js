import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { importNUSModsTimetable } from "../../store/slices/NUSModsURLSlice";

NUSModsTimetableAutoUnschedulePopup.propTypes = {
  NUSModsURL: PropTypes.string.isRequired,
};

function NUSModsTimetableAutoUnschedulePopup({ NUSModsURL }) {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.NUSModsURL.status);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "AUTO_UNSCHEDULE_WARNING") {
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
          The <b>NUSMods</b> timetable that you&apos;re trying to import clashes
          with other scheduled tasks.
          <br />
          <br />
          If you choose to continue, the tasks that clash with the incoming{" "}
          <b>NUSMods</b> timetable will be automatically unscheduled.
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

export default NUSModsTimetableAutoUnschedulePopup;
