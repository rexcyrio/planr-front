import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { FETCHING } from "../../components/helperComponents/DataStatus";
import {
  FETCHING_REDUCER,
  FETCH_FAILURE_REDUCER,
  FETCH_SUCCESS_REDUCER,
  UPDATE_FAILURE_REDUCER,
  UPDATE_SUCCESS_REDUCER,
  UPDATING_REDUCER,
} from "../storeHelpers/statusHelpers";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  permLinks: [],
  tasksLinks: [],
  status: FETCHING,
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    _setPermLinks: (state, action) => {
      state.permLinks = action.payload;
      return state;
    },
    _addNewPermLink: (state, action) => {
      state.permLinks.push(action.payload);
      return state;
    },
    _saveEditedPermLinks: (state, action) => {
      const newLinks = [];
      for (const link of action.payload) {
        if (link._toBeDeleted) {
          continue;
        }

        if (link.name === "") {
          link.name = link.url;
        }

        let finalURL = link.url;
        if (
          !link.url.startsWith("https://") &&
          !link.url.startsWith("http://")
        ) {
          finalURL = "http://".concat(link.url);
        }

        const newLink = {
          ...link,
          url: finalURL,
        };
        newLinks.push(newLink);
      }
      state.permLinks = newLinks;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermLinks.pending, FETCHING_REDUCER)
      .addCase(fetchPermLinks.fulfilled, FETCH_SUCCESS_REDUCER)
      .addCase(fetchPermLinks.rejected, FETCH_FAILURE_REDUCER)

      .addCase(updateLinksInDatabase.pending, UPDATING_REDUCER)
      .addCase(updateLinksInDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(updateLinksInDatabase.rejected, UPDATE_FAILURE_REDUCER)

      .addCase(addLinkToDatabase.pending, UPDATING_REDUCER)
      .addCase(addLinkToDatabase.fulfilled, UPDATE_SUCCESS_REDUCER)
      .addCase(addLinkToDatabase.rejected, UPDATE_FAILURE_REDUCER);
  },
});

// private actions. Only thunks are called from outside
const { _setPermLinks, _addNewPermLink, _saveEditedPermLinks } =
  linksSlice.actions;

export function addNewPermLink(newURL, newName) {
  return function thunk(dispatch) {
    let finalURL = newURL;
    if (!newURL.startsWith("https://") && !newURL.startsWith("http://")) {
      finalURL = "http://".concat(newURL);
    }

    if (newName === "") {
      newName = newURL;
    }

    const newLink = {
      _id: uuidv4(),
      _toBeDeleted: false,
      name: newName,
      url: finalURL,
    };

    dispatch(_addNewPermLink(newLink));
    dispatch(addLinkToDatabase(newLink));
  };
}

export function saveEditedPermLinks(tempLinks) {
  return function thunk(dispatch) {
    dispatch(_saveEditedPermLinks(tempLinks));
    dispatch(updateLinksInDatabase());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

//fix
export const fetchPermLinks = createAsyncThunk(
  "links/fetchPermLinks",
  async (_, { dispatch, getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;

      fetch(`/api/private/links?id=${userId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
            alert(json.error);
            reject(json.error);
          }

          dispatch(_setPermLinks(json.links));
          resolve();
        });
    });
  }
);

export const updateLinksInDatabase = createAsyncThunk(
  "links/updateLinksInDatabase",
  async (_, { getState }) => {
    return new Promise((resolve, reject) => {
      const { userId } = getState().user;
      const links = getState().links.permLinks;

      fetch("/api/private/links", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, links }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
            alert(json.error);
            reject(json.error);
          }

          resolve();
        });
    });
  }
);

export const addLinkToDatabase = createAsyncThunk(
  "links/addLinkToDatabase",
  async (link, { getState }) => {
    return new Promise((resolve, reject) => {
      const userId = getState().user.userId;
      fetch("/api/private/links", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, link }),
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.error) {
            alert(json.error);
            reject(json.error);
          }

          resolve();
        });
    });
  }
);

export default linksSlice.reducer;
