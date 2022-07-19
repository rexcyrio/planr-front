import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveEditedPermLinks } from "../../store/slices/linksSlice";
import { saveEditedModulesLinks } from "../../store/slices/modulesSlice";
import { saveEditedTasksLinks } from "../../store/slices/tasksSlice";
import {
  selectModuleLinks,
  selectTaskLinks,
} from "../../store/storeHelpers/selectors";
import EditLinkItem from "./EditLinkItem";

function LinksEditor() {
  const dispatch = useDispatch();
  const permLinks = useSelector((state) => state.links.permLinks);
  const modulesLinks = useSelector((state) => selectModuleLinks(state));
  const tasksLinks = useSelector((state) => selectTaskLinks(state));
  const [open, setOpen] = useState(false);
  const [tempPermLinks, setTempPermLinks] = useState([]);
  const [tempTasksLinks, setTempTasksLinks] = useState([]);
  const [tempModulesLinks, setTempModulesLinks] = useState([]);

  const closeDialog = () => {
    setOpen(false);
    dispatch(saveEditedPermLinks(tempPermLinks));
    dispatch(saveEditedModulesLinks(tempModulesLinks));
    dispatch(saveEditedTasksLinks(tempTasksLinks));
  };

  const handleOpen = useCallback(() => {
    if (permLinks.length + modulesLinks.length + tasksLinks.length > 0) {
      setTempPermLinks([...permLinks]);
      setTempModulesLinks([...modulesLinks]);
      setTempTasksLinks([...tasksLinks]);
      setOpen(true);
    }
  }, [permLinks, modulesLinks, tasksLinks]);

  const editIcon = useMemo(
    () => (
      <Tooltip title="Edit">
        <IconButton onClick={handleOpen}>
          <EditIcon />
        </IconButton>
      </Tooltip>
    ),
    [handleOpen]
  );

  const discardChangesButton = useMemo(
    () => <Button onClick={() => setOpen(false)}>Discard Changes</Button>,
    []
  );

  return (
    <>
      {editIcon}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md">
        <DialogTitle>Edit your links</DialogTitle>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            closeDialog();
          }}
        >
          <DialogContent>
            {tempPermLinks.map((self) => (
              <React.Fragment key={self._id}>
                <EditLinkItem self={self} setTempLinks={setTempPermLinks} />
              </React.Fragment>
            ))}
            {tempModulesLinks.map((self) => (
              <React.Fragment key={self._id}>
                <EditLinkItem self={self} setTempLinks={setTempModulesLinks} />
              </React.Fragment>
            ))}
            {tempTasksLinks.map((self) => (
              <React.Fragment key={self._id}>
                <EditLinkItem self={self} setTempLinks={setTempTasksLinks} />
              </React.Fragment>
            ))}
          </DialogContent>
          <DialogActions>
            {discardChangesButton}
            <Button type="submit">Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </>
  );
}

export default React.memo(LinksEditor);
