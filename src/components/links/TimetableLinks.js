import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { allThemes } from "../../helper/themeHelper";
import { setTimetableColumn } from "../../store/slices/timeSlice";
import {
  selectModuleLinksWithTags,
  selectTaskLinksWithTags,
} from "../../store/storeHelpers/selectors";
import LinkItem from "./LinkItem";

TimetableLinks.propTypes = {
  isPermLinksEmpty: PropTypes.bool.isRequired,
};

function TimetableLinks({ isPermLinksEmpty }) {
  const dispatch = useDispatch();

  // links from modules that are scheduled today
  const modulesLinks = useSelector((state) => selectModuleLinksWithTags(state));

  // links from tasks that are scheduled today
  const tasksLinks = useSelector((state) => selectTaskLinksWithTags(state));

  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );
  const themeName = useSelector((state) => state.themeName);

  function getColor(tag) {
    const colourName = mappingTagToColourName[tag];
    return allThemes[themeName][colourName];
  }

  useEffect(() => {
    // set interval till the next day
    const date = new Date();
    const interval = setInterval(() => {
      dispatch(setTimetableColumn());
    }, new Date(new Date().setHours(23, 59, 59, 1000)).getTime() - date.getTime());

    return () => clearInterval(interval);
  }, [dispatch]);

  // rendered below perm links
  return isPermLinksEmpty &&
    modulesLinks.length === 0 &&
    tasksLinks.length === 0 ? (
    <div>There are no links.</div>
  ) : (
    <>
      {modulesLinks.flatMap((self) => {
        return self.links.map((linkObj) => (
          <React.Fragment key={linkObj._id}>
            <LinkItem self={linkObj} color={getColor(self.tag)} />
          </React.Fragment>
        ));
      })}
      {tasksLinks.flatMap((self) => {
        return self.links.map((linkObj) => (
          <React.Fragment key={linkObj._id}>
            <LinkItem self={linkObj} color={getColor(self.tag)} />
          </React.Fragment>
        ));
      })}
    </>
  );
}

export default TimetableLinks;
