import LinkIcon from "@mui/icons-material/Link";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { selfPropTypes } from "../../helper/selfPropTypesHelper";
import { addModuleLinks } from "../../store/slices/modulesSlice";
import TaskLinksCreator from "../tasks/TaskLinksCreator";

ModuleLinksManager.propTypes = {
  self: selfPropTypes,
};

function ModuleLinksManager({ self }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const [links, setLinks] = useState(self.links);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [urlState, setUrlState] = useState("NONE");

  function resetState() {
    setLinks(self.links);
    setLinkName("");
    setLinkURL("");
    setUrlState("NONE");
  }

  function handleOpen() {
    resetState();
    setOpen(true);
  }

  function closeDialog(saveChanges) {
    setOpen(false);

    if (saveChanges) {
      dispatch(addModuleLinks(self._id, links));
    }
  }

  return (
    <>
      <Tooltip title="Edit module links">
        <IconButton onClick={handleOpen}>
          <LinkIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={() => closeDialog(false)}
        maxWidth="md"
        PaperProps={{ sx: { width: "41rem" } }}
      >
        <DialogTitle>Edit your modules links</DialogTitle>
        <DialogContent>
          <TaskLinksCreator
            taskLinks={links}
            setTaskLinks={setLinks}
            linkName={linkName}
            setLinkName={setLinkName}
            linkURL={linkURL}
            setLinkURL={setLinkURL}
            urlState={urlState}
            setUrlState={setUrlState}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog(false)}>Discard Changes</Button>
          <Button onClick={() => closeDialog(true)}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ModuleLinksManager;
