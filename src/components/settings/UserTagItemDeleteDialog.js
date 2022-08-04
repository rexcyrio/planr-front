import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { deleteUserTag } from "../../store/slices/userTagsSlice";

UserTagItemDeleteDialog.propTypes = {
  userTag: PropTypes.string.isRequired,
};

function UserTagItemDeleteDialog({ userTag }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(defaultDeleteMode);

  const isOthers = userTag === "Others";

  const handleOpen = useCallback(() => {
    setDeleteMode(defaultDeleteMode);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleDelete = useCallback(() => {
    handleClose();
    dispatch(deleteUserTag(userTag, deleteMode));
  }, [handleClose, dispatch, userTag, deleteMode]);

  const deleteTooltipButton = useMemo(
    () => (
      <Tooltip
        title={isOthers ? '"Others" cannot be deleted' : "Delete tag"}
        disableInteractive
      >
        <span>
          <IconButton edge="end" disabled={isOthers} onClick={handleOpen}>
            <DeleteIcon />
          </IconButton>
        </span>
      </Tooltip>
    ),
    [handleOpen, isOthers]
  );

  return (
    <>
      {deleteTooltipButton}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Tag</DialogTitle>

        <DialogContent>
          <FormControl>
            <FormLabel id="delete-mode">
              Choose how tasks associated with &quot;{userTag}&quot; should be
              handled:
            </FormLabel>
            <RadioGroup
              aria-labelledby="delete-mode"
              value={deleteMode}
              name="delete-mode-radio-buttons-group"
              onChange={(e) => setDeleteMode(e.target.value)}
            >
              {Object.entries(mappingDeleteModeToGetLabelFn).map(
                ([_deleteMode, getLabelFn]) => (
                  <FormControlLabel
                    key={_deleteMode}
                    value={_deleteMode}
                    control={<Radio />}
                    label={getLabelFn(userTag)}
                  />
                )
              )}
            </RadioGroup>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} sx={{ color: "red" }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const mappingDeleteModeToGetLabelFn = {
  CONVERT_ASSOCIATED_TASKS_TO_OTHERS: (tag) => (
    <>
      <span style={{ fontWeight: "bold", color: "#036700" }}>Convert</span> all
      tasks associated with &quot;{tag}&quot; to &quot;Others&quot;
    </>
  ),

  DELETE_ASSOCIATED_TASKS: (tag) => (
    <>
      <span style={{ fontWeight: "bold", color: "#d32f2f" }}>Delete</span> all
      tasks associated with &quot;{tag}&quot;
    </>
  ),
};

const defaultDeleteMode = Object.keys(mappingDeleteModeToGetLabelFn)[0];

export default React.memo(UserTagItemDeleteDialog);
