import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { resetReduxStore } from "../storeHelpers/actions";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER,
} from "../storeHelpers/statusHelpers";

const initialState = {
  data: [],
  status: FETCHING,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    _setNotes: (state, action) => {
      state.data = action.payload;
      return state;
    },
    _addNote: (state, action) => {
      state.data.push(action.payload);
      return state;
    },
    _deleteNote: (state, action) => {
      const notes = state.data;
      const id = action.payload;

      const index = notes.findIndex((each) => each._id === id);
      notes.splice(index, 1);
      return state;
    },
    _saveNote: (state, action) => {
      const notes = state.data;
      const newNote = action.payload;

      const index = notes.findIndex((each) => each._id === newNote._id);
      notes[index] = newNote;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetReduxStore, (state, action) => initialState)

      .addCase(fetchNotes.pending, FETCHING_REDUCER)
      .addCase(fetchNotes.fulfilled, FETCH_SUCCESS_REDUCER)
      .addCase(fetchNotes.rejected, FETCH_FAILURE_REDUCER)

      .addCase(updateNotesInDatabase.pending, UPDATING_REDUCER)
      .addCase(updateNotesInDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(updateNotesInDatabase.rejected, UPDATE_FAILURE_REDUCER)

      .addCase(addNoteToDatabase.pending, UPDATING_REDUCER)
      .addCase(addNoteToDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(addNoteToDatabase.rejected, UPDATE_FAILURE_REDUCER);
  },
});

const { _setNotes, _addNote, _deleteNote, _saveNote } = notesSlice.actions;

export function addNote(newNoteText) {
  return function thunk(dispatch) {
    const trimmedText = newNoteText.trim();

    if (trimmedText !== "") {
      const newNote = {
        _id: uuidv4(),
        text: trimmedText,
      };

      dispatch(_addNote(newNote));
      dispatch(addNoteToDatabase(newNote));
    }
  };
}

export function deleteNote(self) {
  return function thunk(dispatch) {
    dispatch(_deleteNote(self._id));
    dispatch(updateNotesInDatabase());
  };
}

export function saveNote(self, tempNote) {
  return function thunk(dispatch) {
    const newNote = {
      _id: self._id,
      text: tempNote.trim(),
    };

    dispatch(_saveNote(newNote));
    dispatch(updateNotesInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (_, { dispatch, getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch(`/api/private/notes?id=${userId}`);
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }

      dispatch(_setNotes(json.notes));
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

export const updateNotesInDatabase = createAsyncThunk(
  "notes/updateNotesInDatabase",
  async (_, { getState }) => {
    const { userId } = getState().user;
    const notes = getState().notes.data;

    try {
      const res = await fetch("/api/private/notes", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, notes }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

export const addNoteToDatabase = createAsyncThunk(
  "notes/addNoteToDatabase",
  async (note, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/notes", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, note }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

export default notesSlice.reducer;
