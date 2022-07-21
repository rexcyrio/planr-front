import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPermLinks());
  }, [dispatch]);

  function addNewLink() {
    dispatch(addNewPermLink(newName, newURL));
  }

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setNewName("");
    setNewURL("");
  }, []);

  const openAllLinks = useCallback(() => {
    for (const link of links) {
      window.open(link.url, "_blank");
    }
  }, [links]);

  const addIcon = useMemo(
    () => (
      <Tooltip title="Add">
        <IconButton onClick={handleOpen}>
          <AddIcon />
        </IconButton>
      </Tooltip>
    ),
    [handleOpen]
  );

  const linkNameTextField = useMemo(
    () => (
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
    ),
    [newName]
  );

  const linkURLTextField = useMemo(
    () => (
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
    ),
    [newURL]
  );

  const dialogActions = useMemo(
    () => (
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Add</Button>
      </DialogActions>
    ),
    [handleClose]
  );

  const openAllLinksButton = useMemo(
    () => (
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
    ),
    [openAllLinks]
  );

  return (
    <>
      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Links</h1>
          <DataStatus status={status} />
        </div>
        <div>
          <LinksEditor />
          {addIcon}
        </div>
      </div>

      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Add a new link</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            addNewLink();
            handleClose();
          }}
        >
          <DialogContent>
            {linkNameTextField}
            {linkURLTextField}
          </DialogContent>
          {dialogActions}
        </Box>
      </Dialog>

      <LinksList />

      {openAllLinksButton}
    </>
  );
}

export default React.memo(Links);
