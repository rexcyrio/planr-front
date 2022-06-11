import DeleteIcon from "@mui/icons-material/Delete";
import { CircularProgress, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Notes.module.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const { userId } = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/private/notes?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes);
      });
  }, []);

  function insertNote() {
    const trimmedText = newNoteText.trim();

    if (trimmedText !== "") {
      const newNote = {
        _id: uuidv4(),
        text: trimmedText,
        isEditMode: false,
      };

      setUpdating(true);
      addNoteToDatabase(newNote);
      setNotes([...notes, newNote]);
    }

    setNewNoteText("");
  }

  function addNoteToDatabase(note) {
    fetch("/api/private/notes", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, note }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setUpdating(false);
      });
  }

  function deleteNote(self) {
    const newNotes = notes.filter((each) => each._id !== self._id);
    setUpdating(true);
    updateNotesInDatabase(newNotes);
    setNotes(newNotes);
  }

  function updateText(self, text) {
    const newNote = {
      _id: self._id,
      text: text,
      isEditMode: self.isEditMode,
    };

    setNotes((prev) => {
      const index = prev.findIndex((each) => each._id === self._id);
      return [
        ...prev.slice(0, index),
        newNote,
        ...prev.slice(index + 1, prev.length),
      ];
    });
  }

  function updateEditMode(self, newMode) {
    const newNote = {
      _id: self._id,
      text: self.text,
      isEditMode: newMode,
    };

    setNotes((prev) => {
      const index = prev.findIndex((each) => each._id === self._id);
      return [
        ...prev.slice(0, index),
        newNote,
        ...prev.slice(index + 1, prev.length),
      ];
    });
  }

  function exitEditMode(self) {
    const newNote = {
      _id: self._id,
      text: self.text.trim(),
      isEditMode: false,
    };

    const index = notes.findIndex((each) => each._id === self._id);
    const newNotes = [
      ...notes.slice(0, index),
      newNote,
      ...notes.slice(index + 1, notes.length),
    ];
    setUpdating(true);
    updateNotesInDatabase(newNotes);
    setNotes(newNotes);
  }

  function updateNotesInDatabase(notes) {
    fetch("/api/private/notes", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, notes }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setUpdating(false);
      });
  }

  function handleDoubleClick(self) {
    if (self.isEditMode) {
      // double clicking in edit mode should NOT exit edit mode
      // the user might be double clicking to select an entire word
      return;
    }
    updateEditMode(self, true);
  }
  updating;
  return (
    <>
      <div className={styles.title}>
        <h1>Notes</h1>
        <div>
          {updating ? (
            <Tooltip title="Updating Database">
              <CircularProgress
                size={24}
                sx={{
                  padding: "8px",
                  verticalAlign: "middle",
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="In sync with database">
              <DownloadDoneIcon
                color="success"
                sx={{
                  padding: "8px",
                  verticalAlign: "middle",
                }}
              />
            </Tooltip>
          )}
        </div>
      </div>
      <div className={styles["main-container"]}>
        {notes.length > 0 ? (
          <List dense={true} sx={{ maxWidth: "15rem", p: "0px" }}>
            <Divider />

            {notes.map((self) => (
              <React.Fragment key={self._id}>
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
              </React.Fragment>
            ))}
          </List>
        ) : (
          <div>There are no notes.</div>
        )}
      </div>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          insertNote();
        }}
      >
        <TextField
          id="New note"
          label="New note"
          variant="filled"
          placeholder="Type a new note here..."
          autoComplete="off"
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          fullWidth
        />
      </Box>
    </>
  );
}

export default Notes;
