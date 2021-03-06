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
import { resetReduxStore } from "../storeHelpers/actions";

const initialState = {
  permLinks: [],
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
      const newPermLinks = [];
      const links = action.payload;

      for (const link of links) {
        if (link._toBeDeleted) {
          continue;
        }

        if (link.name === "") {
          link.name = link.url;
        }

        if (
          !link.url.startsWith("https://") &&
          !link.url.startsWith("http://")
        ) {
          link.url = "http://" + link.url;
        }

        newPermLinks.push(link);
      }

      state.permLinks = newPermLinks;
      return state;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetReduxStore, (state, action) => initialState)

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

export function addNewPermLink(newName, newURL) {
  return function thunk(dispatch) {
    const finalName = newName || newURL;
    const finalURL =
      newURL.startsWith("https://") || newURL.startsWith("http://")
        ? newURL
        : "http://" + newURL;

    const newLink = {
      _id: uuidv4(),
      _toBeDeleted: false,
      name: finalName,
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
