import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function NUSModsTimetableOverlappingLessonsPopup() {
  const status = useSelector((state) => state.NUSModsURL.status);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "OVERLAPPING_LESSONS_ERROR") {
      setOpen(true);
    }
  }, [status]);

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle>Failed to import NUSMods timetable</DialogTitle>
      <DialogContent>
        <DialogContentText>
          The <b>NUSMods</b> timetable that you&apos;re trying to import has
          overlapping lessons.
          <br />
          <br />
          Please resolve the <b>NUSMods</b> timetable clash before importing it
          into PlanR.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default NUSModsTimetableOverlappingLessonsPopup;
