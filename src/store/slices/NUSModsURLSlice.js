import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { resetReduxStore } from "../storeHelpers/actions";
import { selectModuleCodes } from "../storeHelpers/selectors";
import {
  removeAllModulesInTheme,
  updateModulesInTheme,
} from "./mappingTagToColourNameSlice";
import { refreshMatrix } from "./matrixSlice";
import { setModules } from "./modulesSlice";
import {
  addTask,
  deleteTask,
  unscheduleTasks,
  updateTaskFields,
} from "./tasksSlice";

const initialState = {
  url: "",
  status: "NONE",

  // cache the module information to avoid fetching from NUSMods API again when
  // a timetable clash is detected
  cache: {},

  // cache: {
  //   url: {
  //     dateLastFetched: "",
  //     moduleItems: [],
  //     moduleCodes: [],
  //   },
  //   url2: {
  //     dateLastFetched: "",
  //     moduleItems: [],
  //     moduleCodes: [],
  //   },
  // },
};

const NUSModsURLSlice = createSlice({
  name: "NUSModsURL",
  initialState,
  reducers: {
    _setNUSModsURL: (state, action) => {
      state.url = action.payload;
      return state;
    },
    _setStatus: (state, action) => {
      state.status = action.payload;
      return state;
    },
    _cacheModuleItems: (state, action) => {
      const { url, dateLastFetched, moduleItems, moduleCodes } = action.payload;

      state.cache[url] = {
        dateLastFetched: dateLastFetched,
        moduleItems: moduleItems,
        moduleCodes: moduleCodes,
      };

      return state;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => initialState);
  },
});

export const { _setNUSModsURL } = NUSModsURLSlice.actions;

// private function
const { _setStatus, _cacheModuleItems } = NUSModsURLSlice.actions;

export function resetNUSModsURLStatus() {
  return function thunk(dispatch, getState) {
    dispatch(_setStatus("NONE"));
  };
}

export function importNUSModsTimetable(NUSModsURL, autoRemoveTasks) {
  return async function thunk(dispatch, getState) {
    dispatch(_setStatus("FETCHING"));

    try {
      const [newModuleItems, newModuleCodes] = await (async () => {
        const { cache } = getState().NUSModsURL;
        const dateNow = new Date().toDateString();

        if (
          NUSModsURL in cache &&
          cache[NUSModsURL].dateLastFetched === dateNow
        ) {
          const { moduleItems, moduleCodes } = cache[NUSModsURL];
          return [moduleItems, moduleCodes];
        }

        // need to fetch
        const [moduleItems, moduleCodes] = await fetchModuleItems(NUSModsURL);

        if (moduleCodes.length === 0) {
          throw new Error("Invalid NUSMods URL");
        }

        // cache the moduleItems
        const payload = {
          url: NUSModsURL,
          dateLastFetched: dateNow,
          moduleItems: moduleItems,
          moduleCodes: moduleCodes,
        };

        dispatch(_cacheModuleItems(payload));
        return [moduleItems, moduleCodes];
      })();

      // ======================================================================
      // check for overlapping lessons in module items
      // ======================================================================

      const moduleItems_occupiedCells = {};

      for (const newModuleItem of newModuleItems) {
        const { row, col, timeUnits } = newModuleItem;

        for (let i = 0; i < timeUnits; i++) {
          const str = `${row + i},${col}`;

          if (str in moduleItems_occupiedCells) {
            dispatch(_setStatus("OVERLAPPING_LESSONS_ERROR"));
            return;
          }

          moduleItems_occupiedCells[str] = true;
        }
      }

      // ======================================================================
      // check for current PlanR timetable <-> incoming NUSMods timetable clash
      // ======================================================================

      const matrix = getState().matrix;

      // case 1: no conflicts  + autoRemoveTasks === false    => [FALL THROUGH] setMatrix like normal
      // case 2: YES conflicts + autoRemoveTasks === false    => stop & warn user

      // case 3: no conflicts  + autoRemoveTasks === true     => should NEVER happen
      // case 4: YES conflicts + autoRemoveTasks === true     => continue and remove offending tasks

      // handling cases 1, 2
      if (autoRemoveTasks === false) {
        for (const newModuleItem of newModuleItems) {
          const { row, col, timeUnits } = newModuleItem;

          for (let i = 0; i < timeUnits; i++) {
            const id = matrix[row + i][col];

            //      empty task => "0"
            // old module item => "__CS1010X..."
            if (id !== "0" && id.slice(0, 2) !== "__") {
              // case 2
              dispatch(_setStatus("AUTO_UNSCHEDULE_WARNING"));
              return;
            }
          }
        }
      }

      // handling cases 1, 4
      const tasks = getState().tasks.data;
      const offendingTaskIds = [];

      for (const task of tasks) {
        const { _id, row, col, timeUnits } = task;

        for (let i = 0; i < timeUnits; i++) {
          const str = `${row + i},${col}`;

          if (str in moduleItems_occupiedCells) {
            offendingTaskIds.push(_id);
            break;
          }
        }
      }

      // ======================================================================
      // getting old module codes
      // ======================================================================
      //
      //   BUCKET FILL AREA: old module codes no longer in use
      //      |
      //      |           BUCKET FILL AREA: common module codes
      //      |              |
      //      |              |         BUCKET FILL AREA: never seen before module codes
      // +----|--------------|------+     |
      // |    |              |      |     |
      // |    |     +--------|------|-----|----+
      // |    |     |        |      |     |    |
      // |   (*)    |       (*)     |    (*)   |
      // |          |               |          |
      // +--------------------------+          |
      //            |                          |
      //            +--------------------------+
      //
      // |__________________________|
      //  RECTANGLE: old module codes
      //
      //            |__________________________|
      //             RECTANGLE: new module codes

      const oldModuleCodes = selectModuleCodes(getState());

      const moduleCodesNoLongerInUse = oldModuleCodes.filter(
        (each) => !newModuleCodes.includes(each)
      );

      const moduleCodesNoLongerInUseObject = Object.fromEntries(
        moduleCodesNoLongerInUse.map((each) => [each, true])
      );

      // set tasks with old module codes to "Others"
      for (const task of tasks) {
        const { _id, tag } = task;

        if (tag in moduleCodesNoLongerInUseObject) {
          dispatch(updateTaskFields(_id, { tag: "Others" }));
        }
      }

      dispatch(_setNUSModsURL(NUSModsURL));
      dispatch(setNUSModsURLInDatabase(NUSModsURL));

      dispatch(unscheduleTasks(offendingTaskIds));
      dispatch(updateModulesInTheme(oldModuleCodes, newModuleCodes));
      dispatch(setModules(newModuleItems));

      // ======================================================================
      // Auto generate tutorial tasks
      // ======================================================================

      // need to call `getState()` again since the `dispatch()` above would have
      // modified the tasks data
      const updatedTasks = getState().tasks.data;

      // remove previously auto generated tutorial tasks
      for (const task of updatedTasks) {
        const { _id } = task;

        if (_id.slice(0, 9) === "auto-gen-") {
          dispatch(deleteTask(_id));
        }
      }

      // generate new tutorial tasks
      for (const newModuleItem of newModuleItems) {
        if (newModuleItem.name === "Tutorial") {
          const { tag } = newModuleItem;

          const newTask = {
            _id: "auto-gen-" + uuidv4(),

            name: `Do ${tag} Tutorial`,
            dueDate: "--",
            dueTime: "--",
            durationHours: "1",
            tag: tag,
            links: [],

            row: -1,
            col: -1,
            timeUnits: 2,

            isCompleted: {},
            mondayKey: [],
          };

          dispatch(addTask(newTask));
        }
      }

      dispatch(refreshMatrix());
      dispatch(_setStatus("FETCH_SUCCESS"));
    } catch (error) {
      console.error(error);
      dispatch(_setStatus("FETCH_FAILURE"));
    }
  };
}

export function removeNUSModsTimetable() {
  return function thunk(dispatch, getState) {
    const tasks = getState().tasks.data;
    const moduleCodes = selectModuleCodes(getState());

    const moduleCodesObject = Object.fromEntries(
      moduleCodes.map((each) => [each, true])
    );

    // change all tasks to "Others"
    for (const task of tasks) {
      const { _id, tag } = task;

      if (tag in moduleCodesObject) {
        dispatch(updateTaskFields(_id, { tag: "Others" }));
      }
    }

    dispatch(_setNUSModsURL(""));
    dispatch(setNUSModsURLInDatabase(""));
    dispatch(resetNUSModsURLStatus());

    dispatch(removeAllModulesInTheme());
    dispatch(setModules([]));

    // need to call `getState()` again since the `dispatch()` above would have
    // modified the tasks data
    const updatedTasks = getState().tasks.data;

    // remove previously auto generated tutorial tasks
    for (const task of updatedTasks) {
      const { _id } = task;

      if (_id.slice(0, 9) === "auto-gen-") {
        dispatch(deleteTask(_id));
      }
    }

    dispatch(refreshMatrix());
  };
}

// ============================================================================
// Database thunks
// ============================================================================

const setNUSModsURLInDatabase = createAsyncThunk(
  "NUSModsURL/setNUSModsURLInDatabase",
  async (NUSModsURL, { getState }) => {
    const { userId } = getState().user;

    try {
      const res = await fetch("/api/private/NUSModsURL", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, NUSModsURL }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(formatErrorMessage(json.error));
      }
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  }
);

// ============================================================================
// Helper functions
// ============================================================================

const mappingLessonType = {
  LEC: "Lecture",
  TUT: "Tutorial",
  LAB: "Laboratory",
  SEC: "Sectional Teaching",
  REC: "Recitation",
  SEM: "Seminar-Style Module Class",
};

const mappingDayToColumn = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

async function fetchModuleItems(NUSModsURL) {
  const details = parseNUSModsURL(NUSModsURL);
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

  const promises = moduleCodes.map(async (moduleCode) => {
    const lessonType_classCode_pairs = details[moduleCode];

    // check whether this module has lessons
    if (isEmptyObject(lessonType_classCode_pairs)) {
      return [];
    }

    // fetch module information from NUSMods API
    const res = await fetch(
      `https://api.nusmods.com/v2/${academicYear}/modules/${moduleCode}.json`
    );
    const json = await res.json();

    // getting correct semester data
    const semesterData = json.semesterData.find(
      (each) => each.semester === semester
    );

    // getting correct timetable data
    const timetableData = semesterData.timetable;

    // lessonTypes refer to "Lecture", "Tutorial", "Laboratory", "Sectional Teaching", etc.
    const lessonTypes = Object.keys(lessonType_classCode_pairs);

    const moduleItems = [];

    for (const lessonType of lessonTypes) {
      const classNo = details[moduleCode][lessonType];
      const lessons = timetableData.filter(
        (each) => each.lessonType === lessonType && each.classNo === classNo
      );

      for (const lesson of lessons) {
        const startHour = lesson.startTime.slice(0, 2);
        const startMin = lesson.startTime.slice(2);

        const endHour = lesson.endTime.slice(0, 2);
        const endMin = lesson.endTime.slice(2);

        const durationHours = getDurationHours(
          startHour,
          startMin,
          endHour,
          endMin
        ).toString();

        const moduleItem = {
          _id: `__${moduleCode}&day=${lesson.day}&startTime=${lesson.startTime}`,

          name: lessonType,
          dueDate: "--",
          dueTime: "--",
          durationHours: durationHours,
          venue: lesson.venue,
          tag: moduleCode,
          links: [],

          row: getRow(startHour, startMin),
          col: mappingDayToColumn[lesson.day],
          timeUnits: Math.ceil(Number(durationHours) * 2),

          isCompleted: {},
          mondayKey: [],
        };

        moduleItems.push(moduleItem);
      }
    }

    return moduleItems;
  });

  const allModuleItems = (await Promise.all(promises)).flat();
  return [allModuleItems, moduleCodes];
}

function parseNUSModsURL(NUSModsURL) {
  const url = new URL(NUSModsURL);
  const queryString = url.search;
  // `slice(1)` is to remove the "?" at the beginning
  const keyValueSegments = queryString.slice(1).split("&");
  const keyValuePairs = keyValueSegments.map((each) => each.split("="));
  const result = {};

  for (const [key, value] of keyValuePairs) {
    result[key] = convertStringToObject(value);
  }

  return result;
}

function convertStringToObject(str) {
  if (!str) {
    return {};
  }

  const properties = str.split(",");
  const obj = {};

  for (const property of properties) {
    const [key, value] = property.split(":");
    const lessonType = mappingLessonType[key];
    obj[lessonType] = value;
  }

  return obj;
}

function getDurationHours(startHour, startMin, endHour, endMin) {
  if (startMin === endMin) {
    return Number(endHour) - Number(startHour);
  } else if (startMin === "00" && endMin === "30") {
    return Number(endHour) - Number(startHour) + 0.5;
  } else if (startMin === "30" && endMin === "00") {
    return Number(endHour) - Number(startHour) - 0.5;
  }
}

function getRow(hour, min) {
  let count = 0;

  count += Number(hour) * 2;
  if (min === "30") {
    count += 1;
  }

  return count;
}

function isEmptyObject(obj) {
  return Object.keys(obj).length === 0;
}

export default NUSModsURLSlice.reducer;
