import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { allColourNames } from "../../helper/themeHelper";
import { updateTagColour } from "../../store/slices/mappingTagToColourNameSlice";
import ColourIcon from "./ColourIcon";

TagColourSelect.propTypes = {
  tag: PropTypes.string.isRequired,
  colourName: PropTypes.string.isRequired,
};

function TagColourSelect({ tag, colourName }) {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);

  return (
    <div
      style={{
        width: "14rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div
        title={tag}
        style={{
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {tag}
      </div>

      <Select
        renderValue={(_) => (
          <div
            style={{
              width: "5.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>{getDisplayName(colourName)}</div>
            <ColourIcon themeName={themeName} colourName={colourName} />
          </div>
        )}
        id={`${tag}_colourName`}
        value={colourName}
        onChange={(e) => {
          dispatch(updateTagColour(tag, e.target.value));
        }}
      >
        {allColourNames.map((_colourName) => (
          <MenuItem key={_colourName} value={_colourName}>
            <ListItemText>{getDisplayName(_colourName)}</ListItemText>
            <ListItemIcon>
              <ColourIcon themeName={themeName} colourName={_colourName} />
            </ListItemIcon>
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

function getDisplayName(colourName) {
  return colourName.slice(5).toLowerCase();
}

export default React.memo(TagColourSelect);
