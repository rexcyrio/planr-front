import LabelIcon from "@mui/icons-material/Label";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import React, { useCallback, useState } from "react";
import UserTagItemDeleteDialog from "./UserTagItemDeleteDialog";
import UserTagItemRenameDialog from "./UserTagItemRenameDialog";

UserTagItem.propTypes = {
  userTag: PropTypes.string.isRequired,
};

function UserTagItem({ userTag }) {
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  return (
    <ListItem
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      secondaryAction={
        <Stack
          direction="row"
          spacing={2}
          sx={{ visibility: isMouseOver ? "visible" : "hidden" }}
        >
          <UserTagItemRenameDialog userTag={userTag} />
          <UserTagItemDeleteDialog userTag={userTag} />
        </Stack>
      }
    >
      <ListItemIcon>
        <LabelIcon />
      </ListItemIcon>
      <ListItemText primary={userTag} />
    </ListItem>
  );
}

export default React.memo(UserTagItem);
