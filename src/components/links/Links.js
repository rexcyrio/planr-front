import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../store/AuthContext";
import styles from "./Links.module.css";

function Links() {
  const [links, setLinks] = useState([]);
  const [newName, setNewName] = useState("");
  const [newURL, setNewURL] = useState("");
  const { userData, setUserData, loggedInUsername } = useContext(AuthContext);
  const [add_open, add_setOpen] = useState(false);
  const [edit_open, edit_setOpen] = useState(false);

  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  const loadLinks = () => {
    fetch(`/api/private/links/get-links?username=${loggedInUsername}`)
      .then((res) => res.json())
      .then((json) => {
        setLinks(json.links);
      });
  };

  useEffect(() => {
    loadLinks();
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
          _name: link._name,
          _url: link._url,
          name: link._name,
          url: link._url,
        };
        newLinks.push(newLink);
      }

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
        setLinks(newLinks);
      }
    }
    await sleep(150);
    // setLinks(newLinks);
  };

  function updateLinksInDatabase(links) {
    fetch("/api/private/links/update-links", {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: loggedInUsername, links }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setLinks(json.links);
        userData.links = json.links;
        setUserData({ ...userData });
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

    const index = links.findIndex((each) => each._id === self._id);
    links[index] = newLink;
    setLinks([...links]);
  }

  //not really needed
  function updateTempName(self, _name) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      _name: _name,
      _url: self._url,
      name: self.name,
      url: self.url,
    };

    const index = links.findIndex((each) => each._id === self._id);
    links[index] = newLink;
    setLinks([...links]);
  }

  //not really needed
  function updateTempURL(self, _url) {
    const newLink = {
      _id: self._id,
      _toBeDeleted: self._toBeDeleted,
      _name: self._name,
      _url: _url,
      name: self.name,
      url: self.url,
    };

    const index = links.findIndex((each) => each._id === self._id);
    links[index] = newLink;
    setLinks([...links]);
  }

  function addNewLink() {
    const t = {
      _id: uuidv4(),
      _toBeDeleted: false,
      _name: newName,
      _url: newURL,
      name: newName,
      url: newURL,
    };

    addLinkToDatabase(t);

    // const newLinks = [...links, t];
    // setLinks(newLinks);

    // userData.links = newLinks;
    // setUserData({ ...userData });
    // updateDatabase();
  }

  function addLinkToDatabase(link) {
    fetch("/api/private/links/add-link", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: loggedInUsername, link }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        setLinks(json.links);
        userData.links = json.links;
        setUserData({ ...userData });
      });
  }

  // function updateDatabase() {
  //   fetch("/api/update-data", {
  //     method: "PUT",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ username: loggedInUsername, userData: userData }),
  //   })
  //     .then((res) => res.json())
  //     .then((json) => {
  //       if (json.error) {
  //         alert(json.error);
  //         return;
  //       }

  //       if (json.update_success) {
  //         console.log("successfully updated ; new data is");
  //         console.log(userData);
  //       }
  //     });
  // }

  return (
    <>
      <div className={styles.title}>
        <h1>Links</h1>
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
                    sx={{ marginRight: "1rem", width: "13rem" }}
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
                    sx={{ marginRight: "0.5rem", width: "27rem" }}
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
                  <Tooltip title="Mark for Deletion">
                    <IconButton onClick={() => toggleToBeDeleted(self)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
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
        {links.length > 0 ? (
          <Stack
            direction="column"
            alignItems="stretch"
            justifyContent="flex-start"
            spacing={1}
          >
            {links.map((self) => (
              <a
                key={self._id}
                href={self.url}
                rel="noreferrer noopener"
                target="_blank"
              >
                <div className={styles["links-button"]}>
                  <div>{self.name}</div>
                  <ArrowForwardIcon />
                </div>
              </a>
            ))}
          </Stack>
        ) : (
          <div>There are no links.</div>
        )}
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
