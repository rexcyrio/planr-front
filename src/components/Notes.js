import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../store/AuthContext";
import styles from "./Notes.module.css";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const { userData, setUserData, loggedInUsername } = useContext(AuthContext);

  const loadNotes = () => {
    fetch(`/api/private/notes/get-notes?username=${loggedInUsername}`)
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes);
      });
  };

  useEffect(() => {
    loadNotes();
  }, []);

  function insertNote() {
    const trimmedText = newNoteText.trim();

    if (trimmedText !== "") {
      const newNote = {
        _id: uuidv4(),
        text: trimmedText,
        isEditMode: false,
      };

      addNoteToDatabase(newNote);
    }

    setNewNoteText("");
  }

  function addNoteToDatabase(note) {
    fetch("/api/private/notes/add-note", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: loggedInUsername, note }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setNotes(json.notes);
        userData.notes = json.notes;
        setUserData({ ...userData });
      });
  }

  function deleteNote(self) {
    const t = notes.filter((each) => each._id !== self._id);
    updateNotesInDatabase(t);
  }

  //maybe
  function updateText(self, text) {
    const newNote = {
      _id: self._id,
      text: text,
      isEditMode: self.isEditMode,
    };

    const index = notes.findIndex((each) => each._id === self._id);
    notes[index] = newNote;
    setNotes([...notes]);
  }

  //maybe
  function updateEditMode(self, newMode) {
    const newNote = {
      _id: self._id,
      text: self.text,
      isEditMode: newMode,
    };

    const index = notes.findIndex((each) => each._id === self._id);
    notes[index] = newNote;
    setNotes([...notes]);
  }

  function exitEditMode(self) {
    const newNote = {
      _id: self._id,
      text: self.text.trim(),
      isEditMode: false,
    };

    const index = notes.findIndex((each) => each._id === self._id);
    notes[index] = newNote;
    updateNotesInDatabase(notes);
  }

  function updateNotesInDatabase(notes) {
    fetch("/api/private/notes/update-notes", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: loggedInUsername, notes }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setNotes(json.notes);
        userData.notes = json.notes;
        setUserData({ ...userData });
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

  return (
    <>
      <h1>Notes</h1>
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
