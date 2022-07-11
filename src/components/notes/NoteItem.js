import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useState } from "react";
import DeleteNoteDialog from "./DeleteNoteDialog";
import styles from "./NoteItem.module.css";

NoteItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isEditMode: PropTypes.bool.isRequired,
  }).isRequired,
  
  deleteNote: PropTypes.func.isRequired,
  updateEditMode: PropTypes.func.isRequired,
  exitEditMode: PropTypes.func.isRequired,
  cancelEditMode: PropTypes.func.isRequired,
  updateText: PropTypes.func.isRequired,
};

function NoteItem(props) {
  const {
    self,
    deleteNote,
    updateEditMode,
    exitEditMode,
    cancelEditMode,
    updateText,
  } = props;
  const [originalNote, setOriginalNote] = useState("");

  function handleDoubleClick(self) {
    if (self.isEditMode) {
      // double clicking in edit mode should NOT exit edit mode
      // the user might be double clicking to select an entire word
      return;
    }
    setOriginalNote(self.text);
    updateEditMode(self, true);
  }

  const confirmEditHandler = (e) => {
    if (self.text === "") {
      deleteNote(self);
    } else {
      exitEditMode(self);
    }
  };

  const cancelEditHandler = () => {
    cancelEditMode(self, originalNote);
  };

  return (
    <>
      <ListItem
        sx={{ overflowWrap: "break-word" }}
        onDoubleClick={() => handleDoubleClick(self)}
        secondaryAction={
          <DeleteNoteDialog self={self} deleteNote={deleteNote} />
        }
      >
        {self.isEditMode ? (
          <div className={styles["edit-box"]}>
            <TextField
              autoFocus={true}
              id="editMode"
              variant="outlined"
              autoComplete="off"
              value={self.text}
              fullWidth
              size="small"
              multiline={true}
              maxRows={8}
              onChange={(e) => updateText(self, e.target.value)}
            />
            <div>
              <Tooltip title="Confirm">
                <IconButton onClick={confirmEditHandler}>
                  <CheckIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={cancelEditHandler}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ) : (
          <ListItemText primary={self.text} />
        )}
      </ListItem>
      <Divider />
    </>
  );
}

export default NoteItem;
