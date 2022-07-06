import React, { useEffect } from "react";
import LinkItem from "./LinkItem";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { setTimetableColumn } from "../../store/slices/timeSlice";

TasksLinks.propTypes = {
  emptyPermLinks: PropTypes.bool,
};

function TasksLinks(props) {
  const dispatch = useDispatch();
  const timetableColumn = useSelector((state) => state.time.timetableColumn);

  // links from tasks that are scheduled today
  const tasksLinks = useSelector((state) => {
    return state.tasks.data
      .filter((task) => task.col === timetableColumn)
      .flatMap((task) => task.links);
  });

  useEffect(() => {
    // set interval till the next day
    const interval = setInterval(() => {
      dispatch(setTimetableColumn());
    }, new Date(new Date().setHours(23, 59, 59, 1000)).getTime() - date.getTime());

    return () => clearInterval(interval);
  }, []);

  // rendered below perm links
  return props.emptyPermLinks && tasksLinks.length === 0 ? (
    <div>There are no links.</div>
  ) : (
    tasksLinks.map((self) => (
      <React.Fragment key={self._id}>
        <LinkItem self={self} />
      </React.Fragment>
    ))
  );
}

export default TasksLinks;
