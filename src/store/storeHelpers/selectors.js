import isCurrentWeek from "../../helper/isCurrentWeekHelper";

export function selectModuleLinks() {
  return (state) => {
    const timetableColumn = state.time.timetableColumn;
    return state.modules
      .filter(
        (module) =>
          module.col === timetableColumn && isCurrentWeek(module.mondayKey)
      )
      .flatMap((module) => module.links);
  };
}

export function selectTaskLinks() {
  return (state) => {
    const timetableColumn = state.time.timetableColumn;

    const scheduledRecurringTasksLinks = state.tasks.data
      .filter((task) => task.col !== -1 && task.dueDate === "--")
      .flatMap((task) => task.links);

    const currentWeekTasksLinks = state.tasks.data
      .filter(
        (task) => task.col === timetableColumn && isCurrentWeek(task.mondayKey)
      )
      .flatMap((task) => task.links);

    return scheduledRecurringTasksLinks.concat(currentWeekTasksLinks);
  };
}

export function selectCurrentWeekTasks() {
  return (state) => {
    const mondayKey = state.time.mondayKey;
    const tasks = state.tasks.data;

    const recurringTasks = tasks.filter((each) => {
      return each.mondayKey.length === 0;
    });

    const currentWeekTasks = tasks.filter((each) => {
      for (let i = 0; i < 3; i++) {
        if (each.mondayKey[i] !== mondayKey[i]) {
          return false;
        }
      }
      return true;
    });

    return recurringTasks.concat(currentWeekTasks);
  };
}
