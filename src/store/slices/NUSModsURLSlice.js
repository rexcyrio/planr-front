import { createSlice } from "@reduxjs/toolkit";
import { addModules } from "./modulesSlice";
import { addModulesToTheme } from "./themeSlice";
import { setMatrix } from "./timetableSlice";

const NUSModsURLSlice = createSlice({
  name: "NUSModsURL",
  initialState: {
    url: "",
    status: "NONE",
  },
  reducers: {
    _setURL: (state, action) => {
      const newURL = action.payload;
      return {
        url: newURL,
        status: state.status,
      };
    },
    _setStatus: (state, action) => {
      const newStatus = action.payload;
      return {
        url: state.url,
        status: newStatus,
      };
    },
  },
});

// private function
const { _setURL, _setStatus } = NUSModsURLSlice.actions;

function importNUSModsTimetable(NUSModsURL) {
  return async function thunk(dispatch, getState) {
    dispatch(_setStatus("LOADING"));

    const details = _parseNUSModsURL(NUSModsURL);
    const moduleCodes = Object.keys(details);
    const semester = Number(NUSModsURL.split("/")[4].slice(-1));

    // hard code 15 June as the split between the previous academic year and
    // the new academic year
    const splitDate = new Date();
    // dates are 1-indexed
    splitDate.setDate(15);
    // months are 0-indexed
    splitDate.setMonth(5);

    const isPreviousAcademicYear = new Date() < splitDate;
    const year = Number(new Date().getFullYear());

    const academicYear = isPreviousAcademicYear
      ? `${year - 1}-${year}`
      : `${year}-${year + 1}`;

    const promises = moduleCodes.map((moduleCode) => {
      return new Promise((resolve, reject) => {
        const lessonType_classCode_pairs = details[moduleCode];

        // check whether this module has lessons
        if (_isEmptyObject(lessonType_classCode_pairs)) {
          resolve([]);
          return;
        }

        // fetch module information from NUSMods API
        fetch(
          `https://api.nusmods.com/v2/${academicYear}/modules/${moduleCode}.json`
        )
          .then((res) => res.json())
          .then((json) => {
            // getting correct semester data
            const semesterData = json.semesterData.find(
              (each) => each.semester === semester
            );

            // getting correct timetable data
            const timetableData = semesterData.timetable;

            // lessonTypes refer to "Lecture", "Tutorial", "Laboratory", "Sectional Teaching", etc.
            const lessonTypes = Object.keys(lessonType_classCode_pairs);

            const newModuleItems = [];

            for (const lessonType of lessonTypes) {
              const classNo = details[moduleCode][lessonType];
              const lessons = timetableData.filter(
                (each) =>
                  each.lessonType === lessonType && each.classNo === classNo
              );

              for (const lesson of lessons) {
                const startHour = lesson.startTime.slice(0, 2);
                const startMin = lesson.startTime.slice(2);

                const endHour = lesson.endTime.slice(0, 2);
                const endMin = lesson.endTime.slice(2);

                const durationHours = _getDurationHours(
                  startHour,
                  startMin,
                  endHour,
                  endMin
                ).toString();

                const newModuleItem = {
                  _id: `__${moduleCode}&day=${lesson.day}&startTime=${lesson.startTime}`,

                  name: `${moduleCode} ${lessonType}`,
                  dueDate: "--",
                  dueTime: "--",
                  durationHours: durationHours,
                  moduleCode: moduleCode,
                  links: [],

                  row: _getRow(startHour, startMin),
                  col: _mappingDayToColumn[lesson.day],
                  timeUnits: Math.ceil(Number(durationHours) * 2),

                  isCompleted: false,
                };

                newModuleItems.push(newModuleItem);
              }
            }

            resolve(newModuleItems);
            return;
          });
      });
    });

    const allNewModuleItems = (await Promise.all(promises)).flat();

    // updating matrix
    const values = [];

    for (const newModuleItem of allNewModuleItems) {
      const { _id, row, col, timeUnits } = newModuleItem;

      for (let i = 0; i < timeUnits; i++) {
        values.push([row + i, col, _id]);
      }
    }

    dispatch(_setURL(NUSModsURL));
    dispatch(addModules(allNewModuleItems));
    dispatch(addModulesToTheme(allNewModuleItems));
    dispatch(setMatrix(values));
    dispatch(_setStatus("DONE"));
  };
}

const _mappingLessonType = {
  LEC: "Lecture",
  TUT: "Tutorial",
  LAB: "Laboratory",
  SEC: "Sectional Teaching",
};

const _mappingDayToColumn = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function _parseNUSModsURL(NUSModsURL) {
  const url = new URL(NUSModsURL);
  const queryString = url.search;
  // `slice(1)` is to remove the "?" at the beginning
  const keyValueSegments = queryString.slice(1).split("&");
  const keyValuePairs = keyValueSegments.map((each) => each.split("="));
  const result = {};

  for (const [key, value] of keyValuePairs) {
    result[key] = _convertStringToObject(value);
  }

  return result;
}

function _convertStringToObject(str) {
  if (!str) {
    return {};
  }

  const properties = str.split(",");
  const obj = {};

  for (const property of properties) {
    const [key, value] = property.split(":");
    const lessonType = _mappingLessonType[key];
    obj[lessonType] = value;
  }

  return obj;
}

function _getDurationHours(startHour, startMin, endHour, endMin) {
  if (startMin === endMin) {
    return Number(endHour) - Number(startHour);
  } else if (startMin === "00" && endMin === "30") {
    return Number(endHour) - Number(startHour) + 0.5;
  } else if (startMin === "30" && endMin === "00") {
    return Number(endHour) - Number(startHour) - 0.5;
  }
}

function _getRow(hour, min) {
  let count = 0;

  count += Number(hour) * 2;
  if (min === "30") {
    count += 1;
  }

  return count;
}

function _isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export { NUSModsURLSlice, importNUSModsTimetable };
export default NUSModsURLSlice.reducer;
