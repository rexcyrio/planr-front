import React from "react";
import Skeleton from "@mui/material/Skeleton";

function generateSkeletons(count, child) {
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(
      <React.Fragment key={i}>
        <Skeleton
          sx={{ borderRadius: "5px" }}
          variant="rectangular"
          animation="wave"
          width="auto"
        >
          {child}
        </Skeleton>
      </React.Fragment>
    );
  }
  return arr;
}

export default generateSkeletons;
