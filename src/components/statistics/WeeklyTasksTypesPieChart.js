import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { allThemes } from "../../helper/themeHelper";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";

ChartJS.register(ArcElement, Tooltip, Legend);

function toCountObject(object, keys) {
  const countObject = { ...object };
  for (const key of keys) {
    countObject[key] = 0;
  }
  return countObject;
}

function generateWeekModuleHoursData(countObject, weekTasks, modules) {
  for (const task of weekTasks) {
    countObject[task.moduleCode] += task.timeUnits / 2;
  }
  for (const module of modules) {
    countObject[module.moduleCode] += module.timeUnits / 2;
  }
  return Object.values(countObject);
}

function generateBackgroundColourArray(stringColourArray, themeName) {
  const hexColourArray = stringColourArray.map(
    (colorName) => allThemes[themeName][colorName]
  );
  return hexColourArray;
}

function generateBorderColourArray(stringColourArray, themeName) {
  const hexColourArray = stringColourArray.map((colorName) => {
    const darkColorName = "dark" + colorName.slice(5);
    return allThemes[themeName][darkColorName];
  });
  return hexColourArray;
}

function WeeklyTasksTypesPieChart() {
  const currentWeekTasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
  const themeName = useSelector((state) => state.themeName);
  const mappingModuleCodeToColourName = useSelector(
    (state) => state.mappingModuleCodeToColourName
  );

  const labels = Object.keys(mappingModuleCodeToColourName);
  const stringColourArray = Object.values(mappingModuleCodeToColourName);
  const moduleCodeHoursObject = toCountObject(
    mappingModuleCodeToColourName,
    labels
  );

  const data = {
    labels,
    datasets: [
      {
        label: "sddd",
        data: generateWeekModuleHoursData(
          moduleCodeHoursObject,
          currentWeekTasks,
          modules
        ),
        backgroundColor: generateBackgroundColourArray(
          stringColourArray,
          themeName
        ),
        borderColor: generateBorderColourArray(stringColourArray, themeName),
        borderWidth: 1,
      },
    ],
  };
  return <Pie data={data} />;
}

export default WeeklyTasksTypesPieChart;
