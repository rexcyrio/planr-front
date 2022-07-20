import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  filterModes,
  mappingFilterOptionToFilterFunction,
  setFilterState,
} from "../../store/slices/filteringTasksSlice";

function FilteringTasks() {
  const dispatch = useDispatch();
  const { filterMode, anyAll, filterOptions } = useSelector(
    (state) => state.filteringTasks
  );

  const [open, setOpen] = useState(false);
  const [tempFilterMode, setTempFilterMode] = useState("");
  const [tempAnyAll, setTempAnyAll] = useState("");
  const [tempFilterOptions, setTempFilterOptions] = useState({});

  const openDialog = () => {
    setTempFilterMode(filterMode);
    setTempAnyAll(anyAll);
    setTempFilterOptions(filterOptions);

    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  function handleSave() {
    const newFilterState = {
      filterMode: tempFilterMode,
      anyAll: tempAnyAll,
      filterOptions: tempFilterOptions,
    };

    dispatch(setFilterState(newFilterState));
    closeDialog();
  }

  function isFilterApplied() {
    return filterMode !== "Show all";
  }

  const handleCheckboxChange = (filterOption) => (event) => {
    setTempFilterOptions((prev) => {
      const newState = { ...prev };

      newState[filterOption] = event.target.checked;
      return newState;
    });
  };

  return (
    <>
      {isFilterApplied() ? (
        <Button
          onClick={openDialog}
          startIcon={<FilterAltIcon />}
          variant="contained"
        >
          Filtered
        </Button>
      ) : (
        <Button
          onClick={openDialog}
          startIcon={<FilterListIcon />}
          variant="text"
        >
          Filter
        </Button>
      )}

      <Dialog open={open} onClose={closeDialog}>
        <DialogTitle>Filter Tasks</DialogTitle>

        <DialogContent>
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

          <br />

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

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "1rem",
            }}
          >
            {Object.keys(mappingFilterOptionToFilterFunction).map(
              (filterOption, index) => (
                <React.Fragment key={filterOption}>
                  {index === 6 && <ModuleDivider />}

                  <FormControlLabel
                    label={filterOption}
                    control={
                      <Checkbox
                        disabled={tempFilterMode === "Show all"}
                        checked={tempFilterOptions[filterOption]}
                        onChange={handleCheckboxChange(filterOption)}
                      />
                    }
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

function ModuleDivider() {
  return (
    <Divider>
      <DialogContentText
        sx={{
          fontSize: "0.8rem",
          m: "0.5rem 0",
        }}
      >
        Modules
      </DialogContentText>
    </Divider>
  );
}

export default React.memo(FilteringTasks);
