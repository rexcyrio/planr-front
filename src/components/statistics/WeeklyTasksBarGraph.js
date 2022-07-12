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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function generateWeekWorkloadHoursDistributionData(weekTasks, modules) {
  let data = [];
  for (let i = 0; i < 7; i++) {
    data[i] = 0;
  }
  for (const task of weekTasks) {
    data[task.col] += task.timeUnits / 2;
  }
  for (const module of modules) {
    data[module.col] += module.timeUnits / 2;
  }
  return data;
}

function WeeklyTasksBarGraph() {
  const currentWeekTasks = useSelector(selectCurrentWeekTasks());
  const modules = useSelector((state) => state.modules);
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
    datasets: [
      {
        label: "Dataset 1",
        data: generateWeekWorkloadHoursDistributionData(
          currentWeekTasks,
          modules
        ),
        backgroundColor: "rgb(255, 99, 132)",
      },
    ],
  };
  return <Bar options={options} data={data} />;
}

export default WeeklyTasksBarGraph;
