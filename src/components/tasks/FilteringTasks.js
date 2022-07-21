import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  filterModes,
  setFilterState,
} from "../../store/slices/filteringTasksSlice";
import FilteringTasksCheckbox from "./FilteringTasksCheckbox";

function FilteringTasks() {
  const dispatch = useDispatch();
  const { filterMode, anyAll, filterOptions } = useSelector(
    (state) => state.filteringTasks
  );

  const [open, setOpen] = useState(false);
  const [tempFilterMode, setTempFilterMode] = useState("");
  const [tempAnyAll, setTempAnyAll] = useState("");
  const [tempFilterOptions, setTempFilterOptions] = useState({});

  const openDialog = useCallback(() => {
    setTempFilterMode(filterMode);
    setTempAnyAll(anyAll);
    setTempFilterOptions(filterOptions);

    setOpen(true);
  }, [anyAll, filterMode, filterOptions]);

  function handleSave() {
    const newFilterState = {
      filterMode: tempFilterMode,
      anyAll: tempAnyAll,
      filterOptions: tempFilterOptions,
    };

    dispatch(setFilterState(newFilterState));
    setOpen(false);
  }

  function isFilterApplied() {
    return filterMode !== "Show all";
  }

  const handleCheckboxChange = useCallback(
    (filterOption) => (event) => {
      setTempFilterOptions((prev) => {
        const newState = { ...prev };

        newState[filterOption] = event.target.checked;
        return newState;
      });
    },
    []
  );

  const filtersAppliedButton = useMemo(
    () => (
      <Button
        onClick={openDialog}
        startIcon={<FilterAltIcon />}
        variant="contained"
      >
        Filtered
      </Button>
    ),
    [openDialog]
  );

  const noFiltersAppliedButton = useMemo(
    () => (
      <Button
        onClick={openDialog}
        startIcon={<FilterListIcon />}
        variant="text"
      >
        Filter
      </Button>
    ),
    [openDialog]
  );

  const title = useMemo(() => <DialogTitle>Filter Tasks</DialogTitle>, []);

  const selectFilterMode = useMemo(
    () => (
      <TextField
        id="tempFilterMode"
        select
        label="Filter Mode"
        value={tempFilterMode}
        onChange={(e) => setTempFilterMode(e.target.value)}
        sx={{ width: "10rem", m: "1rem 0" }}
      >
        {filterModes.map((filterMode) => (
          <MenuItem key={filterMode} value={filterMode}>
            {filterMode}
          </MenuItem>
        ))}
      </TextField>
    ),
    [tempFilterMode]
  );

  const selectAnyAll = useMemo(
    () => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <DialogContentText>Task must have</DialogContentText>

        <TextField
          id="anyAll"
          select
          value={tempAnyAll}
          onChange={(e) => setTempAnyAll(e.target.value)}
          sx={{ width: "5rem", m: "0.5rem" }}
          size="small"
        >
          {["any", "all"].map((filterMode) => (
            <MenuItem key={filterMode} value={filterMode}>
              {filterMode}
            </MenuItem>
          ))}
        </TextField>

        <DialogContentText>
          of the following properties to be shown:
        </DialogContentText>
      </div>
    ),
    [tempAnyAll]
  );

  return (
    <>
      {isFilterApplied() ? filtersAppliedButton : noFiltersAppliedButton}

      <Dialog open={open} onClose={() => setOpen(false)}>
        {title}

        <DialogContent>
          {selectFilterMode}
          <br />
          {selectAnyAll}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "1rem",
            }}
          >
            {Object.entries(tempFilterOptions).map(
              ([filterOption, isChecked], index) => (
                <React.Fragment key={filterOption}>
                  <FilteringTasksCheckbox
                    tempFilterMode={tempFilterMode}
                    filterOption={filterOption}
                    isChecked={isChecked}
                    handleCheckboxChange={handleCheckboxChange}
                  />
                </React.Fragment>
              )
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default React.memo(FilteringTasks);
