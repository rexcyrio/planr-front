import DialogContentText from "@mui/material/DialogContentText";
import Divider from "@mui/material/Divider";
import React from "react";

function FilteringTasksTagsDivider() {
  return (
    <Divider>
      <DialogContentText
        sx={{
          fontSize: "0.8rem",
          m: "0.5rem 0",
        }}
      >
        Tags
      </DialogContentText>
    </Divider>
  );
}

export default React.memo(FilteringTasksTagsDivider);
