import { Alert, CircularProgress, Tooltip } from "@mui/material";
import Box from "@mui/material/Box";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import Divider from "@mui/material/Divider";
import ErrorIcon from "@mui/icons-material/Error";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Notes.module.css";
import NoteItem from "./NoteItem";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const { userId } = useContext(AuthContext);
  const [updating, setUpdating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [outOfSync, setOutOfSync] = useState(false);
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);

  useEffect(() => {
    fetch(`/api/private/notes?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes);
        setInitialLoad(false);
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
          setOutOfSync(true);
          setOpenSyncErrorSnackbar(true);
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
          setOutOfSync(true);
          setOpenSyncErrorSnackbar(true);
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

  const closeSnackbar = () => {
    setOpenSyncErrorSnackbar(false);
  };

  const dataStatus = updating ? (
    <Tooltip title="Updating Database">
      <CircularProgress
        size={24}
        sx={{
          padding: "8px",
        }}
      />
    </Tooltip>
  ) : outOfSync ? (
    <Tooltip title="Database sync failed">
      <ErrorIcon
        color="error"
        sx={{
          padding: "8px",
        }}
      />
    </Tooltip>
  ) : (
    <Tooltip title="In sync with database">
      <CloudDoneIcon
        color="success"
        sx={{
          padding: "8px",
        }}
      />
    </Tooltip>
  );

  return (
    <>
      <Snackbar
        open={openSyncErrorSnackbar}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert onClose={closeSnackbar} severity="error" sx={{ width: "100%" }}>
          Something went wrong! Your notes might not be saved
        </Alert>
      </Snackbar>
      <div className={styles.title}>
        <h1>Notes</h1>
        {dataStatus}
      </div>
      <div className={styles["main-container"]}>
        {initialLoad ? (
          <Skeleton
            variant="rectangle"
            height="95%"
            width="90%"
            animation="wave"
            sx={{ margin: "5%", marginTop: 0 }}
          />
        ) : notes.length > 0 ? (
          <List dense={true} sx={{ maxWidth: "15rem", p: "0px" }}>
            <Divider />

            {notes.map((self) => (
              <React.Fragment key={self._id}>
                <NoteItem
                  self={self}
                  handleDoubleClick={handleDoubleClick}
                  deleteNote={deleteNote}
                  exitEditMode={exitEditMode}
                  updateText={updateText}
                />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <div className={styles["no-notes"]}>There are no notes.</div>
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
