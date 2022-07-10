import DeleteIcon from "@mui/icons-material/Delete";
import { Dialog } from "@mui/material";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useState } from "react";

DeleteNoteDialog.propTypes = {
  self: PropTypes.shape({
    id: PropTypes.string,
    text: PropTypes.string,
    isEditMode: PropTypes.bool,
  }),
  deleteNote: PropTypes.func,
};

function DeleteNoteDialog({ self, deleteNote }) {
  const [deleteNoteDialogOpen, setDeleteNoteDialogOpen] = useState(false);

  function confirmDeleteNoteHandler(self) {
    setDeleteNoteDialogOpen(false);
    deleteNote(self);
  }

  return (
    <>
      <Tooltip title="Delete">
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={() => setDeleteNoteDialogOpen(true)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={deleteNoteDialogOpen}
        onClose={() => setDeleteNoteDialogOpen(false)}
        maxWidth="md"
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <p>Delete note from list?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteNoteDialogOpen(false)}>Cancel</Button>
          <Button
            sx={{ color: "red" }}
            onClick={confirmDeleteNoteHandler(self)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default DeleteNoteDialog;
