import DeleteIcon from "@mui/icons-material/Delete";
import { Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useState } from "react";

DeleteNoteDialog.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
  }).isRequired,

  deleteNote: PropTypes.func.isRequired,
};

function DeleteNoteDialog({ self, deleteNote }) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function confirmDeleteNote() {
    setOpen(false);
    deleteNote(self);
  }

  return (
    <>
      <Tooltip title="Delete">
        <IconButton edge="end" aria-label="delete" onClick={handleOpen}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <DialogContentText>This action cannot be undone.</DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button sx={{ color: "red" }} onClick={confirmDeleteNote}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(DeleteNoteDialog);
