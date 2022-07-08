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
    return state.tasks.data
      .filter(
        (task) => task.col === timetableColumn && isCurrentWeek(task.mondayKey)
      )
      .flatMap((task) => task.links);
  };
}

export function selectCurrentWeekTasks() {
  return (state) => {
    const mondayKey = state.time.mondayKey;
    const tasks = state.tasks.data;

    const currentWeekTasks = tasks.filter((each) => {
      for (let i = 0; i < 3; i++) {
        if (each.mondayKey[i] !== mondayKey[i]) {
          return false;
        }
      }
      return true;
    });

    return currentWeekTasks;
  };
}
