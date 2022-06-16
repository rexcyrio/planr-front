import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircularProgress from "@mui/material/CircularProgress";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ErrorIcon from "@mui/icons-material/Error";
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
import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Links.module.css";
import { Alert } from "@mui/material";
import LinkItem from "./LinkItem";
import generateSkeletons from "../../helper/skeletonHelper";

const DUMMY_LINK_ITEM = (
  <LinkItem
    self={{
      _id: "1",
      _toBeDeleted: false,
      _name: "dummy",
      _url: "https://google.com",
      name: "dummy",
      url: "https://google.com",
    }}
  />
);

function Links() {
  const [links, setLinks] = useState([]);
  const [newName, setNewName] = useState("");
  const [newURL, setNewURL] = useState("https://");
  const { userId } = useContext(AuthContext);
  const [add_open, add_setOpen] = useState(false);
  const [edit_open, edit_setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [outOfSync, setOutOfSync] = useState(false);
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
        setInitialLoad(false);
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
    setNewURL("https://");
  };

  const edit_openDialog = () => {
    if (links.length > 0) {
      edit_setOpen(true);
    }
  };

  const edit_closeDialog = async (saveChanges) => {
    edit_setOpen(false);

    const newLinks = [];

    if (saveChanges) {
      for (const link of links) {
        if (link._toBeDeleted) {
          continue;
        }

        const newLink = {
          _id: link._id,
          _toBeDeleted: false,
          _name: link._name,
          _url: link._url,
          name: link._name,
          url: link._url,
        };
        newLinks.push(newLink);
      }

      setUpdating(true);
      updateLinksInDatabase(newLinks);
    } else {
      for (const link of links) {
        const newLink = {
          _id: link._id,
          _toBeDeleted: false,
          _name: link.name,
          _url: link.url,
          name: link.name,
          url: link.url,
        };
        newLinks.push(newLink);
      }
    }
    await sleep(150);
    setLinks(newLinks);
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
          setOutOfSync(true);
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setUpdating(false);
      });
  }

  function _updateLink(newLink) {
    setLinks((prev) => {
      const index = prev.findIndex((each) => each._id === newLink._id);
      return [...prev.slice(0, index), newLink, ...prev.slice(index + 1)];
    });
  }

  function toggleToBeDeleted(self) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: !self._toBeDeleted,
      _name: self._name,
      _url: self._url,
      name: self.name,
      url: self.url,
    };

    _updateLink(newLink);
  }

  function updateTempName(self, _name) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      _name: _name,
      _url: self._url,
      name: self.name,
      url: self.url,
    };

    _updateLink(newLink);
  }

  function updateTempURL(self, _url) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      _name: self._name,
      _url: _url,
      name: self.name,
      url: self.url,
    };

    _updateLink(newLink);
  }

  function addNewLink() {
    const newLink = {
      _id: uuidv4(),
      _toBeDeleted: false,
      _name: newName,
      _url: newURL,
      name: newName,
      url: newURL,
    };
    setUpdating(true);
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
          setOutOfSync(true);
          setOpenSyncErrorSnackbar(true);
          alert(json.error);
          return;
        }

        setUpdating(false);
      });
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
          Something went wrong! Your links might not be saved
        </Alert>
      </Snackbar>
      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Links</h1>
          {dataStatus}
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
            {links.map((self) => (
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
                    required
                    value={self._name}
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
                    type="url"
                    variant="outlined"
                    required
                    value={self._url}
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
              required
              value={newName}
              autoComplete="off"
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              sx={{ width: "27rem" }}
              margin="dense"
              id="url"
              label="URL"
              type="url"
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

      <div className={styles["links-container"]}>
        <Stack spacing={1}>
          {initialLoad ? (
            generateSkeletons(3, DUMMY_LINK_ITEM)
          ) : links.length > 0 ? (
            links.map((self) => (
              <React.Fragment key={self._id}>
                <LinkItem self={self} />
              </React.Fragment>
            ))
          ) : (
            <div>There are no links.</div>
          )}
        </Stack>
      </div>

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
