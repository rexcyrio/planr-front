import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { renameUserTag } from "../../store/slices/userTagsSlice";
import { MAX_TAG_LENGTH, newTagNameStates } from "./UserTagManager";

UserTagItemRenameDialog.propTypes = {
  userTag: PropTypes.string.isRequired,
};

function UserTagItemRenameDialog({ userTag }) {
  const dispatch = useDispatch();
  const userTags = useSelector((state) => state.userTags);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState(userTag);
  const [newTagNameState, setNewTagNameState] = useState("NONE");

  const isOthers = userTag === "Others";

  const resetState = useCallback(() => {
    setNewTagName(userTag);
    setNewTagNameState("NONE");
  }, [userTag]);

  const handleOpen = useCallback(() => {
    resetState();
    setOpen(true);
  }, [resetState]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const isTagNameValid = useCallback(
    (_newTagName) => {
      if (_newTagName.trim() === "") {
        setNewTagNameState("INVALID");
        return false;
      }

      if (_newTagName.length > MAX_TAG_LENGTH) {
        setNewTagNameState("TOO_LONG");
        return false;
      }

      if (userTags.includes(_newTagName)) {
        setNewTagNameState("DUPLICATE");
        return false;
      }

      setNewTagNameState("NONE");
      return true;
    },
    [userTags]
  );

  const handleTagNameChange = useCallback(
    (event) => {
      const _newTagName = event.target.value;
      isTagNameValid(_newTagName);
      setNewTagName(_newTagName);
    },
    [isTagNameValid]
  );

  const handleRename = useCallback(() => {
    if (!isTagNameValid(newTagName)) {
      return;
    }

    const trimmedNewTagName = newTagName.trim();
    dispatch(renameUserTag(userTag, trimmedNewTagName));

    handleClose();
  }, [newTagName, dispatch, handleClose, userTag, isTagNameValid]);

  const renameTooltipButton = useMemo(
    () => (
      <Tooltip
        title={isOthers ? '"Others" cannot be renamed' : "Rename tag"}
        disableInteractive
      >
        <span>
          <IconButton edge="end" disabled={isOthers} onClick={handleOpen}>
            <EditIcon />
          </IconButton>
        </span>
      </Tooltip>
    ),
    [handleOpen, isOthers]
  );

  return (
    <>
      {renameTooltipButton}

      <Dialog open={open} onClose={handleClose} maxWidth="xs">
        <DialogTitle>Rename Tag</DialogTitle>

        <DialogContent>
          <DialogContentText>
            All tasks that are tagged as &quot;{userTag}&quot; will be converted
            to the following new tag name:
          </DialogContentText>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
          >
            <TextField
              id="newTagName"
              type="text"
              variant="outlined"
              value={newTagName}
              label="New tag name"
              onChange={handleTagNameChange}
              helperText={newTagNameStates[newTagNameState].helperText}
              error={newTagNameStates[newTagNameState].error}
              placeholder="e.g. CCA"
              sx={{ mt: "1rem" }}
              autoComplete="off"
              fullWidth
            />
          </form>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleRename}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(UserTagItemRenameDialog);
