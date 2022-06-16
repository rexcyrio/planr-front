import React from "react";
import Skeleton from "@mui/material/Skeleton";

function generateSkeletons(count, child) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr.push(
      <Skeleton key={i} variant="rectangular" animation="wave" width={"auto"}>
        {child}
      </Skeleton>
    );
  }
  return arr;
}

export default generateSkeletons;
