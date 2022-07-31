import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { allThemes } from "../../helper/themeHelper";
import { selectCurrentWeekTasks } from "../../store/storeHelpers/selectors";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Hours by task type",
    },
  },
};

function toCountObject(object, keys) {
  const countObject = { ...object };
  for (const key of keys) {
    countObject[key] = 0;
  }
  return countObject;
}

function generateWeekModuleHoursData(countObject, weekTasks, modules) {
  for (const task of weekTasks) {
    countObject[task.tag] += task.timeUnits / 2;
  }
  for (const module of modules) {
    countObject[module.tag] += module.timeUnits / 2;
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

WeeklyTasksTypesPieChart.propTypes = {
  durationType: PropTypes.string.isRequired,
};

function WeeklyTasksTypesPieChart({ durationType }) {
  const tasks = useSelector(
    durationType === "All"
      ? (state) => state.tasks.data
      : (state) => selectCurrentWeekTasks(state)
  );
  const modules = useSelector((state) => state.modules);
  const themeName = useSelector((state) => state.themeName);
  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );

  const labels = Object.keys(mappingTagToColourName);
  const stringColourArray = Object.values(mappingTagToColourName);
  const tagHoursObject = toCountObject(mappingTagToColourName, labels);

  const data = {
    labels,
    datasets: [
      {
        label: "Module hours",
        data: generateWeekModuleHoursData(tagHoursObject, tasks, modules),
        backgroundColor: generateBackgroundColourArray(
          stringColourArray,
          themeName
        ),
        borderColor: generateBorderColourArray(stringColourArray, themeName),
        borderWidth: 1,
      },
    ],
  };
  return <Pie data={data} options={options} />;
}

export default React.memo(WeeklyTasksTypesPieChart);
