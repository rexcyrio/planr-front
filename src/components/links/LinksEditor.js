import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveEditedPermLinks } from "../../store/slices/linksSlice";
import { saveEditedModulesLinks } from "../../store/slices/modulesSlice";
import { saveEditedTasksLinks } from "../../store/slices/tasksSlice";
import {
  modulesLinksSelector,
  tasksLinksSelector,
} from "../../store/storeHelpers/selectors";
import EditLinkItem from "./EditLinkItem";

function LinksEditor() {
  const dispatch = useDispatch();
  const timetableColumn = useSelector((state) => state.time.timetableColumn);
  const permLinks = useSelector((state) => state.links.permLinks);
  const modulesLinks = useSelector(modulesLinksSelector(timetableColumn));
  const tasksLinks = useSelector(tasksLinksSelector(timetableColumn));
  const [edit_open, edit_setOpen] = useState(false);
  const [tempPermLinks, setTempPermLinks] = useState([]);
  const [tempTasksLinks, setTempTasksLinks] = useState([]);
  const [tempModulesLinks, setTempModulesLinks] = useState([]);

  const edit_openDialog = () => {
    if (permLinks.length + modulesLinks.length + tasksLinks.length > 0) {
      setTempPermLinks([...permLinks]);
      setTempModulesLinks([...modulesLinks]);
      setTempTasksLinks([...tasksLinks]);
      edit_setOpen(true);
    }
  };

  const edit_closeDialog = (saveChanges) => {
    edit_setOpen(false);

    if (saveChanges) {
      dispatch(saveEditedPermLinks(tempPermLinks));
      dispatch(saveEditedModulesLinks(tempModulesLinks));
      dispatch(saveEditedTasksLinks(tempTasksLinks));
    }
  };

  return (
    <>
      <Tooltip title="Edit">
        <IconButton onClick={edit_openDialog}>
          <EditIcon />
        </IconButton>
      </Tooltip>

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
            {tempPermLinks
              .map((self) => (
                <React.Fragment key={self._id}>
                  <EditLinkItem self={self} setTempLinks={setTempPermLinks} />
                </React.Fragment>
              ))
              .concat(
                tempModulesLinks.map((self) => (
                  <React.Fragment key={self._id}>
                    <EditLinkItem
                      self={self}
                      setTempLinks={setTempModulesLinks}
                    />
                  </React.Fragment>
                ))
              )
              .concat(
                tempTasksLinks.map((self) => (
                  <React.Fragment key={self._id}>
                    <EditLinkItem
                      self={self}
                      setTempLinks={setTempTasksLinks}
                    />
                  </React.Fragment>
                ))
              )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => edit_closeDialog(false)}>
              Discard Changes
            </Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default LinksEditor;
