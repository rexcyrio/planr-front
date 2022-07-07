import React, { useEffect } from "react";
import LinkItem from "./LinkItem";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { setTimetableColumn } from "../../store/slices/timeSlice";
import {
  modulesLinksSelector,
  tasksLinksSelector,
} from "../../store/storeHelpers/selectors";

TimetableLinks.propTypes = {
  emptyPermLinks: PropTypes.bool,
};

function TimetableLinks(props) {
  const dispatch = useDispatch();
  const timetableColumn = useSelector((state) => state.time.timetableColumn);

  // links from tasks that are scheduled today
  const tasksLinks = useSelector(tasksLinksSelector(timetableColumn));

  // links from modules that are scheduled today
  const modulesLinks = useSelector(modulesLinksSelector(timetableColumn));

  useEffect(() => {
    // set interval till the next day
    const date = new Date();
    const interval = setInterval(() => {
      dispatch(setTimetableColumn());
    }, new Date(new Date().setHours(23, 59, 59, 1000)).getTime() - date.getTime());

    return () => clearInterval(interval);
  }, [dispatch]);

  // rendered below perm links
  return props.emptyPermLinks &&
    tasksLinks.length === 0 &&
    modulesLinks.length === 0 ? (
    <div>There are no links.</div>
  ) : (
    modulesLinks
      .map((self) => (
        <React.Fragment key={self._id}>
          <LinkItem self={self} />
        </React.Fragment>
      ))
      .concat(
        tasksLinks.map((self) => (
          <React.Fragment key={self._id}>
            <LinkItem self={self} />
          </React.Fragment>
        ))
      )
  );
}

export default TimetableLinks;
