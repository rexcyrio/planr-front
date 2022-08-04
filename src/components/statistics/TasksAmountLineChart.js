import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { convertToKey } from "../../store/slices/timeSlice";
import { useSelector } from "react-redux";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Workload across weeks",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const labels = [
  "3 weeks before",
  "2 weeks before",
  "1 week before",
  "Reference week",
  "1 week after",
  "2 weeks after",
  "3 weeks after",
];

function mondayKeySwitcher(value, mondayKey) {
  const [dateNumber, monthNumber, yearNumber] = mondayKey;
  const dateObject = new Date(yearNumber, monthNumber, dateNumber + 7 * value);
  const newMondayKey = convertToKey(dateObject);
  return newMondayKey;
}

function generateWeeksTasksDistribution(tasks, modules, mondayKey) {
  const countObject = {};
  const recurringTasksWeekHours = getRecurringTasksWeekHours(tasks);
  const modulesWeekHours = getModulesWeekHours(modules);

  for (let i = -3; i < 4; i++) {
    const key = mondayKeySwitcher(i, mondayKey);
    countObject[key] = modulesWeekHours + recurringTasksWeekHours;
  }

  for (const task of tasks) {
    if (countObject[task.mondayKey] !== undefined) {
      countObject[task.mondayKey] += task.timeUnits / 2;
    }
  }

  return Object.values(countObject);
}

function getModulesWeekHours(modules) {
  let count = 0;

  for (const module of modules) {
    count += module.timeUnits / 2;
  }

  return count;
}

function getRecurringTasksWeekHours(tasks) {
  let count = 0;

  for (const task of tasks) {
    if (task.mondayKey.length === 0) {
      count += task.timeUnits / 2;
    }
  }

  return count;
}

function TasksAmountLineChart() {
  const tasks = useSelector((state) => state.tasks.data);
  const modules = useSelector((state) => state.modules);
  const mondayKey = useSelector((state) => state.time.mondayKey);

  const data = {
    labels,
    datasets: [
      {
        fill: true,
        label: "Number of hours",
        data: generateWeeksTasksDistribution(tasks, modules, mondayKey),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return <Line options={options} data={data} />;
}

export default React.memo(TasksAmountLineChart);
