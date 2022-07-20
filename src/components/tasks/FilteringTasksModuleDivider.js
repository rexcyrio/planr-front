import DialogContentText from "@mui/material/DialogContentText";
import Divider from "@mui/material/Divider";
import React from "react";

function FilteringTasksModuleDivider() {
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

export default React.memo(FilteringTasksModuleDivider);
