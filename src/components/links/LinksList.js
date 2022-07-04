import React from "react";
import styles from "./LinksList.module.css";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import LinkItem from "./LinkItem";
import generateSkeletons from "../../helper/skeletonHelper";
import TasksLinks from "./TasksLinks";
import { FETCHING, FETCH_FAILURE } from "../helperComponents/DataStatus";

const DUMMY_LINK_ITEM = (
  <LinkItem
    self={{
      _id: "1",
      _toBeDeleted: false,
      name: "dummy",
      url: "https://google.com",
    }}
  />
);

LinksList.propTypes = {
  dataState: PropTypes.string,
  links: PropTypes.array,
};

function LinksList({ dataState, links }) {
  return (
    <div className={styles["links-container"]}>
      <Stack spacing={1} sx={{ scrollSnapType: "y mandatory" }}>
        {dataState === FETCH_FAILURE ? (
          <div>Unable to retrieve data.</div>
        ) : dataState === FETCHING ? (
          generateSkeletons(3, DUMMY_LINK_ITEM)
        ) : (
          <>
            {links.map((self) => (
              <React.Fragment key={self._id}>
                <LinkItem self={self} />
              </React.Fragment>
            ))}
            <TasksLinks emptyPermLinks={links.length === 0} />
          </>
        )}
      </Stack>
    </div>
  );
}

export default LinksList;
