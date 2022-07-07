import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Alert } from "@mui/material";
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
import { useDispatch, useSelector } from "react-redux";
import { addNewPermLink, fetchPermLinks } from "../../store/slices/linksSlice";
import DataStatus from "../helperComponents/DataStatus";
import styles from "./Links.module.css";
import LinksEditor from "./LinksEditor";
import LinksList from "./LinksList";

function Links() {
  const dispatch = useDispatch();
  const links = useSelector((state) => state.links.permLinks);
  const status = useSelector((state) => state.links.status);
  const [newName, setNewName] = useState("");
  const [newURL, setNewURL] = useState("");
  const [add_open, add_setOpen] = useState(false);

  const [openSyncErrorSnackbar, setOpenSyncErrorSnackbar] = useState(false);

  useEffect(() => {
    dispatch(fetchPermLinks());
  }, [dispatch]);

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

  function addNewLink() {
    dispatch(addNewPermLink(newURL, newName));
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
          <DataStatus status={status} />
        </div>
        <div>
          <LinksEditor />
          <Tooltip title="Add">
            <IconButton onClick={add_openDialog}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

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

      <LinksList />

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
