import React, { useCallback, useMemo, useState } from "react";
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
  taskLinks: PropTypes.array.isRequired,
  setTaskLinks: PropTypes.func.isRequired,
  linkName: PropTypes.string.isRequired,
  setLinkName: PropTypes.func.isRequired,
  linkURL: PropTypes.string.isRequired,
  setLinkURL: PropTypes.func.isRequired,
  urlState: PropTypes.string.isRequired,
  setUrlState: PropTypes.func.isRequired,
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

  const deleteTaskLinkHandler = useCallback(
    (linkId) => {
      setTaskLinks((prev) => prev.filter((each) => each._id !== linkId));
    },
    [setTaskLinks]
  );

  const generateTaskLinks = useCallback(() => {
    return taskLinks.map((link) => (
      <React.Fragment key={link._id}>
        <ListItem
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
            sx={{
              margin: 0,
              maxWidth: "30rem",
            }}
            primaryTypographyProps={{
              style: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
            secondaryTypographyProps={{
              style: {
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </ListItem>
        <Divider />
      </React.Fragment>
    ));
  }, [taskLinks, deleteTaskLinkHandler]);

  const addTaskLinkHandler = useCallback(() => {
    if (linkURL === "") {
      setUrlState("EMPTY");
      return;
    }

    const finalName = linkName || linkURL;
    const finalURL =
      linkURL.startsWith("https://") || linkURL.startsWith("http://")
        ? linkURL
        : "http://" + linkURL;

    const newLink = {
      _id: uuidv4(),
      _toBeDeleted: false,
      name: finalName,
      url: finalURL,
    };

    setIsAddingLink(false);
    setTaskLinks((prev) => [...prev, newLink]);
    setLinkName("");
    setLinkURL("");
  }, [linkName, linkURL, setLinkName, setLinkURL, setTaskLinks, setUrlState]);

  const linksList = useMemo(
    () => (
      <List disablePadding={true} sx={{ mb: "1rem" }}>
        {generateTaskLinks()}
      </List>
    ),
    [generateTaskLinks]
  );

  const linkNameTextField = useMemo(
    () => (
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
    ),
    [linkName, setLinkName]
  );

  const linkURLTextField = useMemo(
    () => (
      <TextField
        sx={{ width: "19.25rem" }}
        margin="dense"
        id="url"
        label="URL"
        type="text"
        variant="outlined"
        value={linkURL}
        autoComplete="off"
        onChange={(e) => setLinkURL(e.target.value)}
        onFocus={() => setUrlState("NONE")}
        helperText={urlStates[urlState].helperText}
        error={urlStates[urlState].error}
      />
    ),
    [linkURL, urlState, setLinkURL, setUrlState]
  );

  const startAddingLinkButton = useMemo(
    () => (
      <Tooltip title="Add link (optional)">
        <IconButton onClick={() => setIsAddingLink(true)}>
          <AddLinkIcon />
        </IconButton>
      </Tooltip>
    ),
    []
  );

  return (
    <>
      {linksList}
      
      {isAddingLink ? (
        <div style={{ display: "flex" }}>
          {linkNameTextField}
          {linkURLTextField}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "3.5rem",
              marginTop: "8px",
              marginLeft: "0.5rem",
            }}
          >
            <Button onClick={addTaskLinkHandler}>Add Link</Button>
          </div>
        </div>
      ) : (
        startAddingLinkButton
      )}
    </>
  );
}

export default React.memo(TaskLinksCreator);
