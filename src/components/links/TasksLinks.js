import React, { useState, useEffect } from "react";
import LinkItem from "./LinkItem";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";

TasksLinks.propTypes = {
  emptyPermLinks: PropTypes.bool,
};

function TasksLinks(props) {
  const [date, setDate] = useState(new Date());
  const col = date.getDay() === 0 ? 6 : date.getDay() - 1;

  // links from tasks that are scheduled today
  const tasksLinks = useSelector((state) => {
    return state.tasks.data
      .filter((task) => task.col === col)
      .flatMap((task) => task.links);
  });

  useEffect(() => {
    // set interval till the next day
    const interval = setInterval(() => {
      // const d = new Date(); // test date change
      // d.setHours(24);
      setDate(new Date());
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
