import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import PropTypes from "prop-types";
import React from "react";

FilteringTasksCheckbox.propTypes = {
  tempFilterMode: PropTypes.string.isRequired,
  filterOption: PropTypes.string.isRequired,
  isChecked: PropTypes.bool.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};

function FilteringTasksCheckbox({
  tempFilterMode,
  filterOption,
  isChecked,
  handleCheckboxChange,
}) {
  return (
    <FormControlLabel
      label={filterOption}
      control={
        <Checkbox
          disabled={tempFilterMode === "Show all"}
          checked={isChecked}
          onChange={handleCheckboxChange(filterOption)}
        />
      }
    />
  );
}

export default React.memo(FilteringTasksCheckbox);
