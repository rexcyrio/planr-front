import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSortByFromLocalStorage,
  mappingSortByToSortFunction,
  setSortBy,
} from "../../store/slices/sortingTasksSlice";

function SortingTasks() {
  const dispatch = useDispatch();
  const sortBy = useSelector((state) => state.sortingTasks.sortBy);

  useEffect(() => {
    dispatch(getSortByFromLocalStorage());
  }, [dispatch]);

  return (
    <TextField
      id="sortBy"
      select
      label="Sort by"
      value={sortBy}
      size="small"
      sx={{ width: "14rem" }}
      onChange={(e) => dispatch(setSortBy(e.target.value))}
    >
      {Object.keys(mappingSortByToSortFunction).map((each) => (
        <MenuItem key={each} value={each}>
          {each}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default SortingTasks;
