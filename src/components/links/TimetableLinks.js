import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTimetableColumn } from "../../store/slices/timeSlice";
import {
  selectModuleLinks,
  selectTaskLinks,
} from "../../store/storeHelpers/selectors";
import LinkItem from "./LinkItem";

TimetableLinks.propTypes = {
  isPermLinksEmpty: PropTypes.bool.isRequired,
};

function TimetableLinks({ isPermLinksEmpty }) {
  const dispatch = useDispatch();

  // links from modules that are scheduled today
  const modulesLinks = useSelector(selectModuleLinks());

  // links from tasks that are scheduled today
  const tasksLinks = useSelector(selectTaskLinks());

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
      {modulesLinks.map((self) => (
        <React.Fragment key={self._id}>
          <LinkItem self={self} />
        </React.Fragment>
      ))}
      {tasksLinks.map((self) => (
        <React.Fragment key={self._id}>
          <LinkItem self={self} />
        </React.Fragment>
      ))}
    </>
  );
}

export default TimetableLinks;
