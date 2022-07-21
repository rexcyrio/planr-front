import PropTypes from "prop-types";
import React from "react";
import { allColourNames } from "../../helper/themeHelper";
import ColourIcon from "./ColourIcon";

AllColourIcons.propTypes = {
  themeName: PropTypes.string.isRequired,
};

function AllColourIcons({ themeName }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      {allColourNames.map((colourName) => (
        <React.Fragment key={colourName}>
          <ColourIcon themeName={themeName} colourName={colourName} />
        </React.Fragment>
      ))}
    </div>
  );
}

export default React.memo(AllColourIcons);
