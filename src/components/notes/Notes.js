import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import DataStatus, {
  FETCHING,
  FETCH_FAILURE,
  FETCH_SUCCESS,
  UPDATE_FAILURE,
  UPDATE_SUCCESS,
  UPDATING
} from "../helperComponents/DataStatus";
import NoteItem from "./NoteItem";
import styles from "./Notes.module.css";

function Notes() {
  const { userId } = useSelector((state) => state.user);
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [dataState, setDataState] = useState(FETCHING);

  useEffect(() => {
    fetch(`/api/private/notes?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setNotes(json.notes);
        setDataState(FETCH_SUCCESS);
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

      setDataState(UPDATING);
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
          setDataState(UPDATE_FAILURE);
          alert(json.error);
          return;
        }

        setDataState(UPDATE_SUCCESS);
      });
  }

  function deleteNote(self) {
    const newNotes = notes.filter((each) => each._id !== self._id);
    setDataState(UPDATING);
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
    setDataState(UPDATING);
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
          setDataState(UPDATE_FAILURE);
          alert(json.error);
          return;
        }

        setDataState(UPDATE_SUCCESS);
      });
  }

  return (
    <>
      <div className={styles["title-update-container"]}>
        <h1>Notes</h1>
        <DataStatus status={dataState} />
      </div>

      <div className={styles["main-container"]}>
        {dataState === FETCH_FAILURE ? (
          <div className={styles["no-notes"]}>Unable to retrieve data.</div>
        ) : dataState === FETCHING ? (
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
