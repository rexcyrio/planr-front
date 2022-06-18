import React from "react";
import styles from "./LinksList.module.css";
import Stack from "@mui/material/Stack";
import PropTypes from "prop-types";
import LinkItem from "./LinkItem";
import generateSkeletons from "../../helper/skeletonHelper";

const DUMMY_LINK_ITEM = (
  <LinkItem
    self={{
      _id: "1",
      _toBeDeleted: false,
      _name: "dummy",
      _url: "https://google.com",
      name: "dummy",
      url: "https://google.com",
    }}
  />
);

function LinksList({ dataState, links }) {
  LinksList.propTypes = {
    dataState: PropTypes.string,
    links: PropTypes.array,
  };

  return (
    <div className={styles["links-container"]}>
      <Stack spacing={1} sx={{ scrollSnapType: "y mandatory" }}>
        {dataState === "LOAD_FAILED" ? (
          <div>Unable to retrieve data.</div>
        ) : dataState === "INITIAL_LOAD" ? (
          generateSkeletons(3, DUMMY_LINK_ITEM)
        ) : links.length > 0 ? (
          links.map((self) => (
            <React.Fragment key={self._id}>
              <LinkItem self={self} />
            </React.Fragment>
          ))
        ) : (
          <div>There are no links.</div>
        )}
      </Stack>
    </div>
  );
}

export default LinksList;
