import { batch } from "react-redux";
import formatErrorMessage from "../../helper/formatErrorMessage";
import { _setMappingModuleCodeToColourName } from "../slices/mappingModuleCodeToColourNameSlice";
import { _setMatrixFromDatabase } from "../slices/matrixSlice";
import { _setModules } from "../slices/modulesSlice";
import { _setNUSModsURL } from "../slices/NUSModsURLSlice";
import { _setTasks } from "../slices/tasksSlice";
import { _setThemeName } from "../slices/themeNameSlice";

export function fetchAll() {
  return async function thunk(dispatch, getState) {
    const { userId } = getState().user;

    try {
      const items = await Promise.all([
        getItemFromDatabase("tasks", userId),
        getItemFromDatabase("modules", userId),
        getItemFromDatabase("timetable", userId),

        getItemFromDatabase("NUSModsURL", userId),
        getItemFromDatabase("themeName", userId),
        getItemFromDatabase("mappingModuleCodeToColourName", userId),
      ]);

      const [
        databaseTasks,
        databaseModules,
        databaseTimetable,

        databaseNUSModsURL,
        databaseThemeName,
        databaseMappingModuleCodeToColourName,
      ] = items;

      batch(() => {
        dispatch(_setTasks(databaseTasks));
        dispatch(_setModules(databaseModules));
        dispatch(_setMatrixFromDatabase(databaseTimetable));

        dispatch(_setNUSModsURL(databaseNUSModsURL));
        dispatch(_setThemeName(databaseThemeName));
        dispatch(
          _setMappingModuleCodeToColourName(
            databaseMappingModuleCodeToColourName
          )
        );
      });
    } catch (error) {
      alert(error);
      console.error(error);
      throw error;
    }
  };
}

async function getItemFromDatabase(type, userId) {
  const res = await fetch(`/api/private/${type}?id=${userId}`);
  const json = await res.json();

  if (json.error) {
    throw new Error(formatErrorMessage(json.error));
  }

  return json[type];
}
