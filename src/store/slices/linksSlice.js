import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { inSync, outOfSync } from "../storeHelpers/statusHelpers";

const initialState = {
  permLinks: [],
  tasksLinks: [],

  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  status: "INITIAL_LOAD",
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    setPermLinks: (state, action) => {
      state.permLinks = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermLinks.fulfilled, (state) => {
        state.status = "IN_SYNC";
      })
      .addCase(fetchPermLinks.rejected, (state) => {
        state.status = "LOAD_FAILED";
      })
      .addCase(updateLinksInDatabase.fulfilled, inSync)
      .addCase(updateLinksInDatabase.rejected, outOfSync)
      .addCase(addLinkToDatabase.fulfilled, inSync)
      .addCase(addLinkToDatabase.rejected, outOfSync);
  },
});

export const fetchPermLinks = createAsyncThunk(
  "links/fetchPermLinks",
  async (_, { dispatch, getState }) => {
    const userId = getState().user.userId;
    const res = await fetch(`/api/private/links?id=${userId}`);
    const json = res.json();
    dispatch(setPermLinks(json.links));
  }
);

export const updateLinksInDatabase = createAsyncThunk(
  "links/updateLinksInDatabase",
  async (links, { getState }) => {
    const userId = getState.user.userId;
    const res = fetch("/api/private/links", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: userId, links }),
    });
    const json = res.json();

    if (json.error) {
      alert(json.error);
      throw new Error(json.error);
    }
  }
);

export const addLinkToDatabase = createAsyncThunk(
  "links/addLinkToDatabase",
  async (link, { getState }) => {
    const userId = getState.user.userId;
    const res = fetch("/api/private/links", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, link }),
    });
    const json = res.json();

    if (json.error) {
      alert(json.error);
      throw new Error(json.error);
    }
  }
);

export const { setPermLinks } = linksSlice.actions;

export default linksSlice.reducer;
