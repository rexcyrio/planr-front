import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import { generateEmptyWeekArray } from "../../helper/statsHelper";
import { allThemes } from "../../helper/themeHelper";
import PropTypes from "prop-types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  plugins: {
    title: {
      display: true,
      text: "Reference week workload hours distribution",
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: true,
    },
  },
};

const labels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function toArrayCountObject(object, keys) {
  const arrayCountObject = { ...object };

  for (const key of keys) {
    arrayCountObject[key] = generateEmptyWeekArray();
  }

  return arrayCountObject;
}

function generateWeekWorkloadHoursDistributionData(
  arrayCountObject,
  weekTasks,
  modules
) {
  for (const task of weekTasks) {
    arrayCountObject[task.tag][task.col] += task.timeUnits / 2;
  }

  for (const module of modules) {
    arrayCountObject[module.tag][module.col] += module.timeUnits / 2;
  }

  return arrayCountObject;
}

function generateDatasetObjectsArray(
  nestedDataObject,
  tags,
  themeName,
  mappingTagToColourName
) {
  const datasets = [];

  for (const tag of tags) {
    const colourName = mappingTagToColourName[tag];
    const data = {
      label: tag,
      data: nestedDataObject[tag],
      backgroundColor: allThemes[themeName][colourName],
    };

    datasets.push(data);
  }

  return datasets;
}

WeeklyTasksBarGraph.propTypes = {
  taskType: PropTypes.string.isRequired,
};

function WeeklyTasksBarGraph({ taskType }) {
  let currentWeekTasks = useSelector(state => selectCurrentWeekTasks(state));
  let modules = useSelector((state) => state.modules);

  const themeName = useSelector((state) => state.themeName);
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );
  const tags = Object.keys(mappingTagToColourName);

  const arrayCountObject = toArrayCountObject(mappingTagToColourName, tags);

  if (taskType === "Completed") {
    currentWeekTasks = currentWeekTasks.filter(
      (task) => task.isCompleted[mondayKey] !== undefined
    );
    modules = [];
  }

  if (taskType === "Incomplete") {
    currentWeekTasks = currentWeekTasks.filter(
      (task) => task.isCompleted[mondayKey] === undefined
    );
    modules = [];
  }

  const nestedDataObject = generateWeekWorkloadHoursDistributionData(
    arrayCountObject,
    currentWeekTasks,
    modules
  );

  const data = {
    labels,
    datasets: generateDatasetObjectsArray(
      nestedDataObject,
      tags,
      themeName,
      mappingTagToColourName
    ),
  };

  return <Bar options={options} data={data} />;
}

export default React.memo(WeeklyTasksBarGraph);
