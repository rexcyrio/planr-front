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
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { saveEditedPermLinks } from "../../store/slices/linksSlice";

function LinksEditor() {
  const dispatch = useDispatch();
  const links = useSelector((state) => state.links.permLinks);
  const [edit_open, edit_setOpen] = useState(false);
  const [tempLinks, setTempLinks] = useState([]);

  const edit_openDialog = () => {
    if (links.length > 0) {
      setTempLinks([...links]);
      edit_setOpen(true);
    }
  };

  const edit_closeDialog = (saveChanges) => {
    edit_setOpen(false);

    if (saveChanges) {
      dispatch(saveEditedPermLinks(tempLinks));
    }
  };

  function updateTempLink(newLink) {
    setTempLinks((prev) => {
      const index = prev.findIndex((each) => each._id === newLink._id);
      return [...prev.slice(0, index), newLink, ...prev.slice(index + 1)];
    });
  }

  function toggleToBeDeleted(self) {
    const newLink = {
      ...self,
      _toBeDeleted: !self._toBeDeleted,
    };

    updateTempLink(newLink);
  }

  function updateTempName(self, name) {
    const newLink = {
      ...self,
      name: name,
    };

    updateTempLink(newLink);
  }

  function updateTempURL(self, url) {
    const newLink = {
      ...self,
      url: url,
    };

    updateTempLink(newLink);
  }

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
    </>
  );
}

export default LinksEditor;
