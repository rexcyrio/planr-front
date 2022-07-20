import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import Skeleton from "@mui/material/Skeleton";
import TextField from "@mui/material/TextField";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNote,
  deleteNote,
  fetchNotes,
  saveNote,
} from "../../store/slices/notesSlice";
import DataStatus, {
  FETCHING,
  FETCH_FAILURE,
} from "../helperComponents/DataStatus";
import NoteItem from "./NoteItem";
import styles from "./Notes.module.css";

function Notes() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.notes.data);
  const dataState = useSelector((state) => state.notes.status);
  const [newNoteText, setNewNoteText] = useState("");

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  function insertNote() {
    dispatch(addNote(newNoteText));
    setNewNoteText("");
  }

  const removeNote = useCallback(
    (self) => {
      dispatch(deleteNote(self));
    },
    [dispatch]
  );

  const exitEditMode = useCallback(
    (self, tempNote) => {
      dispatch(saveNote(self, tempNote));
    },
    [dispatch]
  );

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
                  deleteNote={removeNote}
                  exitEditMode={exitEditMode}
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
          label="Create a new note"
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
