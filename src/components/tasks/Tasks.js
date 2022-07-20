import Stack from "@mui/material/Stack";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EMPTY_TASK } from "../../helper/EmptyTaskHelper";
import generateSkeletons from "../../helper/skeletonHelper";
import {
  getFilterStateFromLocalStorage,
  mappingFilterOptionToFilterFunction,
} from "../../store/slices/filteringTasksSlice";
import { mappingSortByToSortFunction } from "../../store/slices/sortingTasksSlice";
import { fetchTasks } from "../../store/slices/tasksSlice";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import DataStatus, {
  FETCHING,
  FETCH_FAILURE,
} from "../helperComponents/DataStatus";
import FilteringTasks from "./FilteringTasks";
import InitialSnackBar from "./InitialSnackBar";
import SortingTasks from "./SortingTasks";
import TaskCreator from "./TaskCreator";
import TaskDeleteCompleted from "./TaskDeleteCompleted";
import TaskItem from "./TaskItem";
import styles from "./Tasks.module.css";

const EMPTY_TASK_ITEM = <TaskItem self={EMPTY_TASK} />;

function Tasks() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.tasks.status);
  const tasks = useSelector(selectCurrentWeekTasks());
  const mondayKey = useSelector((state) => state.time.mondayKey);

  const filterState = useSelector((state) => state.filteringTasks);
  const sortBy = useSelector((state) => state.sortingTasks.sortBy);

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(getFilterStateFromLocalStorage());
  }, [dispatch]);

  function filterTasks(tasks) {
    const { filterMode, anyAll, filterOptions } = filterState;

    if (filterMode === "Show all") {
      // no need to apply filtering
      return tasks;
    }

    if (anyAll === "any") {
      const taskIdsToShow = {};

      for (const [filterOption, isChecked] of Object.entries(filterOptions)) {
        if (!isChecked) {
          continue;
        }

        const filterFunction =
          mappingFilterOptionToFilterFunction[filterOption];

        let filteredTasks;

        if (
          filterOption === "is completed" ||
          filterOption === "is incomplete"
        ) {
          // need to supply mondayKey before filtering
          filteredTasks = tasks.filter((each) =>
            filterFunction(mondayKey)(each)
          );
        } else {
          filteredTasks = tasks.filter((each) => filterFunction(each));
        }

        for (const task of filteredTasks) {
          const { _id } = task;
          taskIdsToShow[_id] = true;
        }
      }

      return tasks.filter((each) => each._id in taskIdsToShow);
    }

    if (anyAll === "all") {
      let tasksToShow = [...tasks];

      for (const [filterOption, isChecked] of Object.entries(filterOptions)) {
        if (!isChecked) {
          continue;
        }

        const filterFunction =
          mappingFilterOptionToFilterFunction[filterOption];

        if (
          filterOption === "is completed" ||
          filterOption === "is incomplete"
        ) {
          // need to supply mondayKey before filtering
          tasksToShow = tasksToShow.filter((each) =>
            filterFunction(mondayKey)(each)
          );
        } else {
          tasksToShow = tasksToShow.filter((each) => filterFunction(each));
        }
      }

      return tasksToShow;
    }

    throw new Error("Invalid `anyAll` value");
  }

  function sortTasks(tasks) {
    if (sortBy === "Date created (oldest)") {
      return tasks;
    }

    if (sortBy === "Date created (newest)") {
      return tasks.reverse();
    }

    const sortFunction = mappingSortByToSortFunction[sortBy];
    return tasks.sort(sortFunction);
  }

  function getTaskItems() {
    const filteredTasks = filterTasks(tasks);
    const sortedTasks = sortTasks(filteredTasks);

    const outstandingTasks = sortedTasks.filter(
      (each) => each.isCompleted[mondayKey] === undefined
    );
    const doneTasks = sortedTasks.filter(
      (each) => each.isCompleted[mondayKey] !== undefined
    );

    return (
      <>
        {outstandingTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem self={each} />
          </React.Fragment>
        ))}

        {doneTasks.map((each) => (
          <React.Fragment key={each._id}>
            <TaskItem self={each} />
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <>
      <InitialSnackBar />

      <div className={styles.title}>
        <div className={styles["title-update-container"]}>
          <h1>Tasks</h1>
          <DataStatus status={status} />
        </div>

        <TaskDeleteCompleted />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 0.5rem 0.5rem",
        }}
      >
        <SortingTasks />
        <FilteringTasks />
      </div>

      <Stack
        spacing={1}
        className="hide-scrollbar"
        sx={{
          marginX: "0.5rem",
          overflowY: "auto",
          marginBottom: "10rem",
          height: "calc(100% - 8.15rem)",
        }}
      >
        {status === FETCH_FAILURE ? (
          <div className={styles["no-tasks"]}>Unable to retrieve data.</div>
        ) : status === FETCHING ? (
          generateSkeletons(5, EMPTY_TASK_ITEM)
        ) : tasks.length > 0 ? (
          getTaskItems()
        ) : (
          <div className={styles["no-tasks"]}>There are no tasks.</div>
        )}

        <div style={{ marginBottom: "4.5rem" }}></div>
      </Stack>

      <TaskCreator />
    </>
  );
}

export default React.memo(Tasks);
