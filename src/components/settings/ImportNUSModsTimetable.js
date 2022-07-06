import DoneIcon from "@mui/icons-material/Done";
import ErrorIcon from "@mui/icons-material/Error";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { importNUSModsTimetable } from "../../store/slices/NUSModsURLSlice";

function ImportNUSModsTimetable() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.NUSModsURL.status);
  const [NUSModsURL, setNUSModsURL] = useState(
    useSelector((state) => state.NUSModsURL.url)
  );

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(importNUSModsTimetable(NUSModsURL));
  }

  return (
    <>
      <h4>Import NUSMods Timetable</h4>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          id="NUSModsURL"
          type="url"
          variant="outlined"
          value={NUSModsURL}
          label="NUSMods URL"
          fullWidth
          required
          onChange={(e) => setNUSModsURL(e.target.value)}
          placeholder="e.g. https://nusmods.com/timetable/sem-1/share?..."
        />
        <br />
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Button type="submit" variant="contained" sx={{ m: "1rem 0" }}>
            Import Timetable
          </Button>
          {mappingStatusToIcon[status]}
        </div>
      </Box>
    </>
  );
}

const mappingStatusToIcon = {
  NONE: <></>,
  FETCHING: (
    <Tooltip title="Importing timetable...">
      <CircularProgress
        size="1.5rem"
        sx={{
          ml: "1rem",
        }}
      />
    </Tooltip>
  ),
  FETCH_SUCCESS: (
    <Tooltip title="Timetable successfully imported">
      <DoneIcon
        sx={{
          ml: "1rem",
          color: "grey",
        }}
      />
    </Tooltip>
  ),
  FETCH_FAILURE: (
    <Tooltip title="Failed to import timetable">
      <ErrorIcon
        sx={{
          ml: "1rem",
          color: "#cc0000",
        }}
      />
    </Tooltip>
  ),
};

export default ImportNUSModsTimetable;
