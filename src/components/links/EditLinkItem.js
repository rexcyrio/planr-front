import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React from "react";

EditLinkItem.propTypes = {
  self: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    url: PropTypes.string,
    _toBeDeleted: PropTypes.bool,
  }),
  setTempLinks: PropTypes.func,
};

function EditLinkItem({ self, setTempLinks }) {
  function updateTempLinks(newLink) {
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

    updateTempLinks(newLink);
  }

  function updateTempName(self, name) {
    const newLink = {
      ...self,
      name: name,
    };

    updateTempLinks(newLink);
  }

  function updateTempURL(self, url) {
    const newLink = {
      ...self,
      url: url,
    };
    updateTempLinks(newLink);
  }

  return (
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
  );
}

export default EditLinkItem;
