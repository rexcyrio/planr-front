import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import InfoIcon from "@mui/icons-material/Info";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useState, useEffect, useContext } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Notes.module.css";
import NoteItem from "./NoteItem";
import DataStatus from "../helperComponents/DataStatus";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const { userId } = useContext(AuthContext);
  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  const [dataState, setDataState] = useState("INITIAL_LOAD");
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);

  useEffect(() => {
    fetch(`/api/private/notes?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes);
        setDataState("IN_SYNC");
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

      setDataState("UPDATING");
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
          setDataState("OUT_OF_SYNC");
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setDataState("IN_SYNC");
      });
  }

  function deleteNote(self) {
    const newNotes = notes.filter((each) => each._id !== self._id);
    setDataState("UPDATING");
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
    setDataState("UPDATING");
    updateNotesInDatabase(newNotes);
    setNotes(newNotes);
  }

  function cancelEditMode(self, prevText) {
    const newNote = {
      _id: self._id,
      text: prevText,
      isEditMode: false,
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
          setDataState("OUT_OF_SYNC");
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setDataState("IN_SYNC");
      });
  }

  const closeSnackbar = () => {
    setOpenSyncErrorSnackbar(false);
  };

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
        <div className={styles["title-update-container"]}>
          <h1>Notes</h1>
          <DataStatus status={dataState} />
        </div>
        <Tooltip title="Double click existing notes to edit">
          <InfoIcon color="info" />
        </Tooltip>
      </div>

      <div className={styles["main-container"]}>
        {dataState === "LOAD_FAILED" ? (
          <div className={styles["no-notes"]}>Unable to retrieve data.</div>
        ) : dataState === "INITIAL_LOAD" ? (
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
                  deleteNote={deleteNote}
                  updateEditMode={updateEditMode}
                  exitEditMode={exitEditMode}
                  cancelEditMode={cancelEditMode}
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
          label="create new note"
          variant="filled"
          placeholder="Press enter to add"
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
