import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { allThemes } from "../../helper/themeHelper";
import { setThemeName } from "../../store/slices/themeNameSlice";
import AllColourIcons from "./AllColourIcons";

function ThemeName() {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);

  return (
    <>
      <h4>Theme</h4>

      <FormControl fullWidth>
        <InputLabel id="themeNameLabel">Theme Name</InputLabel>
        <Select
          labelId="themeNameLabel"
          id="themeName"
          value={themeName}
          label="Theme Name"
          fullWidth
          onChange={(e) => {
            dispatch(setThemeName(e.target.value));
          }}
          renderValue={(themeName) => (
            <SelectRenderValue themeName={themeName} />
          )}
        >
          {Object.keys(allThemes).map((themeName) => (
            <MenuItem key={themeName} value={themeName}>
              <ListItemText>{themeName}</ListItemText>
              <ListItemIcon>
                <AllColourIcons themeName={themeName} />
              </ListItemIcon>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}

SelectRenderValue.propTypes = {
  themeName: PropTypes.string.isRequired,
};

function SelectRenderValue({ themeName }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>{themeName}</div>
      <AllColourIcons themeName={themeName} />
    </div>
  );
}

export default ThemeName;
