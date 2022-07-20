import PropTypes from "prop-types";
import React from "react";
import { allThemes } from "../../helper/themeHelper";

ColourIcon.propTypes = {
  themeName: PropTypes.string.isRequired,
  colourName: PropTypes.string.isRequired,
};

function ColourIcon({ themeName, colourName }) {
  const backgroundColor = allThemes[themeName][colourName];

  return (
    <div
      style={{
        height: "1rem",
        width: "1rem",
        backgroundColor: backgroundColor,
        borderRadius: "5px",
      }}
    ></div>
  );
}

export default React.memo(ColourIcon);
