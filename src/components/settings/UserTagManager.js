import ListSubheader from "@mui/material/ListSubheader";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import TextField from "@mui/material/TextField";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUserTag } from "../../store/slices/userTagsSlice";
import UserTagItem from "./UserTagItem";
import { selectTags } from "../../store/storeHelpers/selectors";

function UserTagManager() {
  const dispatch = useDispatch();
  const tags = useSelector((state) => selectTags(state));
  const userTags = useSelector((state) => state.userTags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagNameState, setNewTagNameState] = useState("NONE");

  const resetState = useCallback(() => {
    setNewTagName("");
    setNewTagNameState("NONE");
  }, []);

  const isTagNameValid = useCallback(
    (_newTagName) => {
      const trimmedNewTagName = _newTagName.trim();

      if (trimmedNewTagName === "") {
        setNewTagNameState("INVALID");
        return false;
      }

      if (trimmedNewTagName.length > MAX_TAG_LENGTH) {
        setNewTagNameState("TOO_LONG");
        return false;
      }

      if (tags.includes(trimmedNewTagName)) {
        setNewTagNameState("DUPLICATE");
        return false;
      }

      setNewTagNameState("NONE");
      return true;
    },
    [tags]
  );

  const handleTagNameChange = useCallback(
    (event) => {
      const _newTagName = event.target.value;
      isTagNameValid(_newTagName);
      setNewTagName(_newTagName);
    },
    [isTagNameValid]
  );

  const handleClickAdd = useCallback(() => {
    if (!isTagNameValid(newTagName)) {
      return;
    }

    const trimmedNewTagName = newTagName.trim();
    dispatch(addUserTag(trimmedNewTagName));

    resetState();
  }, [newTagName, dispatch, resetState, isTagNameValid]);

  const newTagNameTextField = useMemo(
    () => (
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
        sx={{ width: "28rem" }}
        autoComplete="off"
      />
    ),
    [handleTagNameChange, newTagName, newTagNameState]
  );

  const listOfUserTags = useMemo(
    () => (
      <List
        subheader={
          <ListSubheader component="div" id="User Tags">
            User Tags
          </ListSubheader>
        }
      >
        <Divider />
        {userTags.map((userTag) => (
          <React.Fragment key={userTag}>
            <UserTagItem userTag={userTag} />
            <Divider />
          </React.Fragment>
        ))}
      </List>
    ),
    [userTags]
  );

  const addTagButton = useMemo(
    () => <Button onClick={handleClickAdd}>Add Tag</Button>,
    [handleClickAdd]
  );

  return (
    <>
      <h4 style={{ marginTop: "2rem" }}>Tag Manager</h4>

      <div
        style={{
          display: "flex",
          margin: "0.75rem 0",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleClickAdd();
          }}
        >
          {newTagNameTextField}
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "3.5rem",
            marginLeft: "0.25rem",
          }}
        >
          {addTagButton}
        </div>
      </div>

      {listOfUserTags}
    </>
  );
}

export const MAX_TAG_LENGTH = 8;

export const newTagNameStates = {
  NONE: {
    helperText: "Leading and trailing spaces will be automatically removed",
    error: false,
  },
  TOO_LONG: {
    helperText: `Maximum length of tag name is ${MAX_TAG_LENGTH} characters`,
    error: true,
  },
  DUPLICATE: {
    helperText: "Duplicate tag names are not allowed",
    error: true,
  },
  INVALID: {
    helperText: "Please provide a valid tag name",
    error: true,
  },
};

export default React.memo(UserTagManager);
