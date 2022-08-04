import PropTypes from "prop-types";
import React, { useEffect, useMemo } from "react";
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
  const moduleLinks = useSelector((state) => selectModuleLinksWithTags(state));

  // links from tasks that are scheduled today
  const taskLinks = useSelector((state) => selectTaskLinksWithTags(state));

  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );
  const themeName = useSelector((state) => state.themeName);

  function getColor(tag) {
    const colourName = mappingTagToColourName[tag];
    return allThemes[themeName][colourName];
  }

  useEffect(() => {
    let timer = null;

    function setTimerForMidnight() {
      const msUntilMidnight =
        new Date().setHours(23, 59, 59, 1000) - Date.now();

      const _timer = setTimeout(() => {
        dispatch(setTimetableColumn());
        timer = setTimerForMidnight();
      }, msUntilMidnight);

      return _timer;
    }

    timer = setTimerForMidnight();
    return () => clearTimeout(timer);
  }, [dispatch]);

  const isModuleLinksEmpty = useMemo(
    () => moduleLinks.map((each) => each.links).flat().length === 0,
    [moduleLinks]
  );

  const isTaskLinksEmpty = useMemo(
    () => taskLinks.map((each) => each.links).flat().length === 0,
    [taskLinks]
  );

  // rendered below perm links
  return isPermLinksEmpty && isModuleLinksEmpty && isTaskLinksEmpty ? (
    <div>There are no links.</div>
  ) : (
    <>
      {moduleLinks.map((each) => {
        const { links, tag } = each;

        return links.map((self) => (
          <React.Fragment key={self._id}>
            <LinkItem self={self} color={getColor(tag)} />
          </React.Fragment>
        ));
      })}

      {taskLinks.map((each) => {
        const { links, tag } = each;

        return links.map((self) => (
          <React.Fragment key={self._id}>
            <LinkItem self={self} color={getColor(tag)} />
          </React.Fragment>
        ));
      })}
    </>
  );
}

export default TimetableLinks;
