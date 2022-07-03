import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./Links.module.css";
import { Alert } from "@mui/material";
import DataStatus from "../helperComponents/DataStatus";
import LinksList from "./LinksList";
import { useSelector } from "react-redux";

function Links() {
  const { userId } = useSelector((state) => state.user);
  const [links, setLinks] = useState([]);
  const [newName, setNewName] = useState("");
  const [newURL, setNewURL] = useState("");
  const [add_open, add_setOpen] = useState(false);
  const [edit_open, edit_setOpen] = useState(false);
  const [tempLinks, setTempLinks] = useState([]);
  // INITIAL_LOAD, LOAD_FAILED, IN_SYNC, OUT_OF_SYNC, UPDATING
  const [dataState, setDataState] = useState("INITIAL_LOAD");
  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);

  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  useEffect(() => {
    fetch(`/api/private/links?id=${userId}`)
      .then((res) => res.json())
      .then((json) => {
        setLinks(json.links);
        setDataState("IN_SYNC");
      });
  }, []);

  function openAllLinks() {
    for (const link of links) {
      window.open(link.url, "_blank");
    }
  }

  const add_openDialog = () => {
    add_setOpen(true);
  };

  const add_closeDialog = () => {
    add_setOpen(false);
    setNewName("");
    setNewURL("");
  };

  const edit_openDialog = () => {
    if (links.length > 0) {
      setTempLinks([...links]);
      edit_setOpen(true);
    }
  };

  const edit_closeDialog = async (saveChanges) => {
    edit_setOpen(false);

    const newLinks = [];

    if (saveChanges) {
      for (const link of tempLinks) {
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
          _id: link._id,
          _toBeDeleted: false,
          name: link.name,
          url: finalURL,
        };
        newLinks.push(newLink);
      }

      setDataState("UPDATING");
      updateLinksInDatabase(newLinks);
      setLinks(newLinks);
    }
    //await sleep(150);
  };

  function updateLinksInDatabase(links) {
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
          setDataState("OUT_OF_SYNC");
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setDataState("IN_SYNC");
      });
  }

  function updateTempLink(newLink) {
    setTempLinks((prev) => {
      const index = prev.findIndex((each) => each._id === newLink._id);
      return [...prev.slice(0, index), newLink, ...prev.slice(index + 1)];
    });
  }

  function toggleToBeDeleted(self) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: !self._toBeDeleted,
      name: self.name,
      url: self.url,
    };

    updateTempLink(newLink);
  }

  function updateTempName(self, name) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      name: name,
      url: self.url,
    };

    updateTempLink(newLink);
  }

  function updateTempURL(self, url) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      name: self.name,
      url: url,
    };

    updateTempLink(newLink);
  }

  function addNewLink() {
    let finalURL = newURL;
    if (!newURL.startsWith("https://") && !newURL.startsWith("http://")) {
      finalURL = "http://".concat(newURL);
    }

    const newLink = {
      _id: uuidv4(),
      _toBeDeleted: false,
      name: newName,
      url: finalURL,
    };

    if (newName === "") {
      newLink.name = newURL;
    }

    setDataState("UPDATING");
    addLinkToDatabase(newLink);
    setLinks([...links, newLink]);
  }

  function addLinkToDatabase(link) {
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
          Something went wrong! Your links might not be saved
        </Alert>
      </Snackbar>
      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Links</h1>
          <DataStatus status={dataState} />
        </div>
        <div>
          <Tooltip title="Edit">
            <IconButton onClick={edit_openDialog}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add">
            <IconButton onClick={add_openDialog}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <Dialog
        open={edit_open}
        onClose={() => edit_closeDialog(false)}
        maxWidth="md"
      >
        <DialogTitle>Edit your links</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            edit_closeDialog(true);
          }}
        >
          <DialogContent>
            {tempLinks.map((self) => (
              <React.Fragment key={self._id}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TextField
                    disabled={self._toBeDeleted}
                    sx={{
                      marginRight: "1rem",
                      width: "13rem",
                      textDecoration: self._toBeDeleted ? "line-through" : "",
                    }}
                    margin="dense"
                    id="name"
                    label="Link Name"
                    type="text"
                    variant="outlined"
                    value={self.name}
                    autoComplete="off"
                    onChange={(e) => updateTempName(self, e.target.value)}
                  />
                  <TextField
                    disabled={self._toBeDeleted}
                    sx={{
                      marginRight: "0.5rem",
                      width: "27rem",
                      textDecoration: self._toBeDeleted ? "line-through" : "",
                    }}
                    margin="dense"
                    id="url"
                    label="URL"
                    type="text"
                    variant="outlined"
                    required
                    value={self.url}
                    autoComplete="off"
                    onChange={(e) => updateTempURL(self, e.target.value)}
                  />
                  {self._toBeDeleted ? (
                    <Tooltip title="Restore link">
                      <IconButton onClick={() => toggleToBeDeleted(self)}>
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="Delete link">
                      <IconButton onClick={() => toggleToBeDeleted(self)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <br />
                </Box>
              </React.Fragment>
            ))}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => edit_closeDialog(false)}>
              Discard Changes
            </Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={add_open} onClose={add_closeDialog} maxWidth="md">
        <DialogTitle>Add a new link</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            addNewLink();
            add_closeDialog();
          }}
        >
          <DialogContent>
            <TextField
              sx={{ marginRight: "1rem", width: "13rem" }}
              margin="dense"
              id="name"
              label="Link Name"
              type="text"
              variant="outlined"
              value={newName}
              autoComplete="off"
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              sx={{ width: "27rem" }}
              margin="dense"
              id="url"
              label="URL"
              type="text"
              variant="outlined"
              required
              value={newURL}
              autoComplete="off"
              onChange={(e) => setNewURL(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={add_closeDialog}>Cancel</Button>
            <Button type="submit">Add</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <LinksList dataState={dataState} links={links} />

      <Stack justifyContent="flex-end" direction="row" padding="0.5em">
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={openAllLinks}
          color="secondary"
        >
          OPEN ALL
        </Button>
      </Stack>
    </>
  );
}

export default Links;
