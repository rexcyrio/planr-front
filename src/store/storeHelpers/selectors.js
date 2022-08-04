import { createSelector } from "@reduxjs/toolkit";
import isCurrentWeek from "../../helper/isCurrentWeekHelper";

export const selectModuleLinks = createSelector(
  (state) => state.time.timetableColumn,
  (state) => state.modules,
  (timetableColumn, modules) => {
    return modules
      .filter((module) => module.col === timetableColumn)
      .flatMap((module) => module.links);
  }
);

export const selectModuleLinksWithTags = createSelector(
  (state) => state.time.timetableColumn,
  (state) => state.modules,
  (timetableColumn, modules) => {
    return modules
      .filter((module) => module.col === timetableColumn)
      .map((module) => ({ links: module.links, tag: module.tag }));
  }
);

export const selectTaskLinks = createSelector(
  (state) => state.time.timetableColumn,
  (state) => state.tasks.data,
  (timetableColumn, tasks) => {
    const scheduledRecurringTasksLinks = tasks
      .filter((task) => task.col === timetableColumn && task.dueDate === "--")
      .flatMap((task) => task.links);

    const currentWeekTasksLinks = tasks
      .filter(
        (task) => task.col === timetableColumn && isCurrentWeek(task.mondayKey)
      )
      .flatMap((task) => task.links);

    return scheduledRecurringTasksLinks.concat(currentWeekTasksLinks);
  }
);

export const selectTaskLinksWithTags = createSelector(
  (state) => state.time.timetableColumn,
  (state) => state.tasks.data,
  (timetableColumn, tasks) => {
    const scheduledRecurringTasksLinksWithTags = tasks
      .filter((task) => task.col === timetableColumn && task.dueDate === "--")
      .map((task) => ({ links: task.links, tag: task.tag }));

    const currentWeekTasksLinksWithTags = tasks
      .filter(
        (task) => task.col === timetableColumn && isCurrentWeek(task.mondayKey)
      )
      .map((task) => ({ links: task.links, tag: task.tag }));

    return scheduledRecurringTasksLinksWithTags.concat(
      currentWeekTasksLinksWithTags
    );
  }
);

export const selectModuleCodes = createSelector(
  (state) => state.mappingTagToColourName,
  (state) => state.userTags,
  (mappingTagToColourName, userTags) => {
    const allTags = Object.keys(mappingTagToColourName);
    const userTagsObject = Object.fromEntries(
      userTags.map((tag) => [tag, true])
    );

    const moduleCodes = allTags.filter((tag) => !(tag in userTagsObject));
    return moduleCodes;
  }
);

export const selectTags = createSelector(
  (state) => state.mappingTagToColourName,
  (state) => state.userTags,
  (mappingTagToColourName, userTags) => {
    const allTags = Object.keys(mappingTagToColourName);
    const userTagsObject = Object.fromEntries(
      userTags.map((tag) => [tag, true])
    );

    const moduleCodes = allTags.filter((tag) => !(tag in userTagsObject));
    return [...moduleCodes, ...userTags];
  }
);

export const selectCurrentWeekTasks = createSelector(
  (state) => state.time.mondayKey,
  (state) => state.tasks.data,
  (mondayKey, tasks) => {
    const currentWeekTasks = tasks.filter((each) => {
      if (each.mondayKey.length === 0) {
        return true;
      }

      for (let i = 0; i < 3; i++) {
        if (each.mondayKey[i] !== mondayKey[i]) {
          return false;
        }
      }

      return true;
    });

    return currentWeekTasks;
  }
);
