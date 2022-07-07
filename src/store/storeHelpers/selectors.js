export function modulesLinksSelector(timetableColumn) {
  return (state) => {
    return state.modules
      .filter((module) => module.col === timetableColumn)
      .flatMap((module) => module.links);
  };
}

export function tasksLinksSelector(timetableColumn) {
  return (state) => {
    return state.tasks.data
      .filter((task) => task.col === timetableColumn)
      .flatMap((task) => task.links);
  };
}
