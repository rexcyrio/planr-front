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

export const selectTags = createSelector(
  (state) => state.mappingTagToColourName,
  (mappingTagToColourName) => {
    return Object.keys(mappingTagToColourName);
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
