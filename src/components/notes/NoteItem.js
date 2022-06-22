import React, { useState } from "react";
import PropTypes from "prop-types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import { Divider, ListItem, ListItemText } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./NoteItem.module.css";

NoteItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    isEditMode: PropTypes.bool,
  }),
  deleteNote: PropTypes.func,
  updateEditMode: PropTypes.func,
  exitEditMode: PropTypes.func,
  cancelEditMode: PropTypes.func,
  updateText: PropTypes.func,
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
          <Tooltip title="Delete">
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => deleteNote(self)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
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
