import React, { useState } from "react";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

TaskLinksCreator.propTypes = {
  taskLinks: PropTypes.array,
  setTaskLinks: PropTypes.func,
  linkName: PropTypes.string,
  setLinkName: PropTypes.func,
  linkURL: PropTypes.string,
  setLinkURL: PropTypes.func,
  urlState: PropTypes.string,
  setUrlState: PropTypes.func,
};

const urlStates = {
  NONE: {
    helperText: " ",
    error: false,
  },
  EMPTY: {
    helperText: "URL cannot be empty",
    error: true,
  },
};

function TaskLinksCreator({
  taskLinks,
  setTaskLinks,
  linkName,
  setLinkName,
  linkURL,
  setLinkURL,
  urlState,
  setUrlState,
}) {
  const [isAddingLink, setIsAddingLink] = useState(false);

  const addTaskLinkHandler = () => {
    if (linkName === "" && linkURL === "") {
      return;
    }

    if (linkURL === "") {
      setUrlState("EMPTY");
      return;
    }

    let finalURL = linkURL;
    if (!linkURL.startsWith("https://") && !linkURL.startsWith("http://")) {
      finalURL = "http://".concat(linkURL);
    }

    setIsAddingLink(false);
    setTaskLinks((prev) => {
      const newLink = {
        _id: uuidv4(),
        _toBeDeleted: false,
        _name: linkName,
        _url: finalURL,
        name: linkName,
        url: finalURL,
      };

      if (linkName === "") {
        newLink._name = linkURL;
        newLink.name = linkURL;
      }
      return [...prev, newLink];
    });
    setLinkName("");
    setLinkURL("");
  };

  const deleteTaskLinkHandler = (linkId) => {
    setTaskLinks((prev) => {
      return prev.filter((link) => link._id !== linkId);
    });
  };

  function generateTaskLinks() {
    return taskLinks.map((link) => {
      return (
        <>
          <ListItem
            key={link._id}
            divider={true}
            secondaryAction={
              <Tooltip title="Remove link">
                <IconButton onClick={() => deleteTaskLinkHandler(link._id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={link.name}
              secondary={link.url}
              sx={{ margin: 0 }}
            />
          </ListItem>
          <Divider />
        </>
      );
    });
  }

  return (
    <>
      <List disablePadding={true}>{generateTaskLinks()}</List>
      {isAddingLink ? (
        <>
          <TextField
            sx={{ marginRight: "1rem", width: "10rem" }}
            margin="dense"
            id="name"
            label="Link Name"
            type="text"
            variant="outlined"
            value={linkName}
            autoComplete="off"
            onChange={(e) => setLinkName(e.target.value)}
          />
          <TextField
            sx={{ width: "20rem" }}
            margin="dense"
            id="url"
            label="URL"
            type="url"
            variant="outlined"
            value={linkURL}
            autoComplete="off"
            onChange={(e) => setLinkURL(e.target.value)}
            onFocus={() => setUrlState("NONE")}
            helperText={urlStates[urlState].helperText}
            error={urlStates[urlState].error}
          />
          <Button onClick={addTaskLinkHandler} sx={{ marginTop: "1rem" }}>
            Add Link
          </Button>
        </>
      ) : (
        <Tooltip title="Add link (optional)">
          <IconButton onClick={() => setIsAddingLink(true)}>
            <AddLinkIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  );
}

export default TaskLinksCreator;
