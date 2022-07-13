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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
    arrayCountObject[task.moduleCode][task.col] += task.timeUnits / 2;
  }
  for (const module of modules) {
    arrayCountObject[module.moduleCode][module.col] += module.timeUnits / 2;
  }

  return arrayCountObject;
}

function generateDatasetObjectsArray(
  nestedDataObject,
  keys,
  themeName,
  mappingModuleCodeToColourName
) {
  const datasets = [];

  for (const key of keys) {
    const colorName = mappingModuleCodeToColourName[key];
    const data = {
      label: key,
      data: nestedDataObject[key],
      backgroundColor: allThemes[themeName][colorName],
    };
    datasets.push(data);
  }

  return datasets;
}

function WeeklyTasksBarGraph() {
  const currentWeekTasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
  const themeName = useSelector((state) => state.themeName);
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.mappingModuleCodeToColourName
  );

  const moduleCodeKeys = Object.keys(mappingModuleCodeToColourName);
  const arrayCountObject = toArrayCountObject(
    mappingModuleCodeToColourName,
    moduleCodeKeys
  );
  const nestedDataObject = generateWeekWorkloadHoursDistributionData(
    arrayCountObject,
    currentWeekTasks,
    modules
  );

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Current week workload hours distribution",
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

  const data = {
    labels,
    datasets: generateDatasetObjectsArray(
      nestedDataObject,
      moduleCodeKeys,
      themeName,
      mappingModuleCodeToColourName
    ),
  };

  return <Bar options={options} data={data} />;
}

export default WeeklyTasksBarGraph;
