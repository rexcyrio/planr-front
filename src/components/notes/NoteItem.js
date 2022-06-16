import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Divider,
  IconButton,
  ListItem,
  ListItemText,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

NoteItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string,
    text: PropTypes.string,
    isEditMode: PropTypes.bool,
  }),
  handleDoubleClick: PropTypes.func,
  deleteNote: PropTypes.func,
  exitEditMode: PropTypes.func,
  updateText: PropTypes.func,
};
function NoteItem(props) {
  const { self, handleDoubleClick, deleteNote, exitEditMode, updateText } =
    props;
  return (
    <>
      <ListItem
        sx={{ overflowWrap: "break-word" }}
        onDoubleClick={() => handleDoubleClick(self)}
        secondaryAction={
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => deleteNote(self)}
          >
            <DeleteIcon />
          </IconButton>
        }
      >
        {self.isEditMode ? (
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();

              if (self.text === "") {
                deleteNote(self);
              } else {
                exitEditMode(self);
              }
            }}
          >
            <TextField
              autoFocus={true}
              id="editMode"
              variant="outlined"
              autoComplete="off"
              value={self.text}
              fullWidth
              size="small"
              onChange={(e) => updateText(self, e.target.value)}
            />
          </Box>
        ) : (
          <ListItemText primary={self.text} />
        )}
      </ListItem>
      <Divider />
    </>
  );
}

export default NoteItem;
