import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import DeleteNoteDialog from "./DeleteNoteDialog";
import styles from "./NoteItem.module.css";

NoteItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,

  deleteNote: PropTypes.func.isRequired,
  exitEditMode: PropTypes.func.isRequired,
};

function NoteItem({ self, deleteNote, exitEditMode }) {
  const [tempNote, setTempNote] = useState(self.text);
  const [editMode, setEditMode] = useState(false);

  function handleDoubleClick(self) {
    if (editMode) {
      // double clicking in edit mode should NOT exit edit mode
      // the user might be double clicking to select an entire word
      return;
    }
    setTempNote(self.text);
    setEditMode(true);
  }

  const confirmEditHandler = useCallback(() => {
    if (tempNote === "") {
      deleteNote(self);
    } else {
      exitEditMode(self, tempNote);
    }
    setEditMode(false);
  }, [self, deleteNote, exitEditMode, tempNote]);

  const cancelEditHandler = useCallback(() => {
    setEditMode(false);
    setTempNote(self.text);
  }, [self]);

  const confirmEditIcon = useMemo(
    () => (
      <Tooltip title="Confirm">
        <IconButton onClick={confirmEditHandler}>
          <CheckIcon />
        </IconButton>
      </Tooltip>
    ),
    [confirmEditHandler]
  );

  const cancelEditIcon = useMemo(
    () => (
      <Tooltip title="Cancel">
        <IconButton onClick={cancelEditHandler}>
          <CloseIcon />
        </IconButton>
      </Tooltip>
    ),
    [cancelEditHandler]
  );

  const secondaryAction = useMemo(
    () => <DeleteNoteDialog self={self} deleteNote={deleteNote} />,
    [self, deleteNote]
  );

  return (
    <>
      <ListItem
        sx={{ overflowWrap: "break-word", backgroundColor: "#f5f5dc60" }}
        onDoubleClick={() => handleDoubleClick(self)}
        secondaryAction={secondaryAction}
      >
        {editMode ? (
          <div className={styles["edit-box"]}>
            <TextField
              autoFocus={true}
              id="editMode"
              variant="outlined"
              autoComplete="off"
              value={tempNote}
              fullWidth
              size="small"
              multiline={true}
              maxRows={8}
              sx={{ backgroundColor: "white" }}
              onChange={(e) => setTempNote(e.target.value)}
            />
            <div>
              {confirmEditIcon}
              {cancelEditIcon}
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

export default React.memo(NoteItem);
