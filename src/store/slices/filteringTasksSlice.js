import { createSlice } from "@reduxjs/toolkit";
import { resetReduxStore } from "../storeHelpers/actions";
import { selectTags } from "../storeHelpers/selectors";
import { setIsFiltersUpdatedSnackBarOpen } from "./isFiltersUpdatedSnackBarOpenSlice";

const initialState = {
  filterMode: "Show all",
  anyAll: "any",
  filterOptions: {
    "is scheduled": false,
    "is unscheduled": false,
    "is completed": false,
    "is incomplete": false,
    "is recurring": false,
    "is one-off": false,
  },
};

const filteringTasksSlice = createSlice({
  name: "filteringTasks",
  initialState,
  reducers: {
    _setFilterState: (state, action) => action.payload,
  },
  extraReducers: (builder) => {
    builder.addCase(resetReduxStore, (state, action) => {
      window.localStorage.removeItem("filterState");
      return initialState;
    });
  },
});

const { _setFilterState } = filteringTasksSlice.actions;

export function setFilterState(filterState) {
  return function thunk(dispatch, getState) {
    dispatch(_setFilterState(filterState));
    window.localStorage.setItem("filterState", JSON.stringify(filterState));
  };
}

export function getFilterStateFromLocalStorage() {
  return function thunk(dispatch, getState) {
    const jsonString = window.localStorage.getItem("filterState");

    if (jsonString === null) {
      dispatch(refreshTagsInFilterOptions(true));
      return;
    }

    // compare the state in local storage against that generated from the database
    const localStorage_state = JSON.parse(jsonString);
    const {
      filterMode: localStorage_filterMode, // eslint-disable-line no-unused-vars
      anyAll: localStorage_anyAll, // eslint-disable-line no-unused-vars
      filterOptions: localStorage_filterOptions,
    } = localStorage_state;

    const localStorage_filterOptionKeys = Object.keys(
      localStorage_filterOptions
    );

    const initialFilterOptionKeys = Object.keys(initialState.filterOptions);
    const tags = selectTags(getState());

    const newFilterOptionKeys = [
      ...initialFilterOptionKeys,
      ...tags.map((tag) => convertTagToFilterOptionKey(tag)),
    ];

    const isFilterOptionKeysEqual = (() => {
      if (localStorage_filterOptionKeys.length !== newFilterOptionKeys.length) {
        return false;
      }

      for (const key of newFilterOptionKeys) {
        if (!(key in localStorage_filterOptions)) {
          return false;
        }
      }

      return true;
    })();

    if (isFilterOptionKeysEqual) {
      // directly calling private reducer instead of thunk wrapper since
      // localStorage does not need to be updated again
      dispatch(_setFilterState(localStorage_state));
      return;
    }

    // since the state in the local storage does not match that generated from
    // the database, reconstruct a new state instead

    // by default, all filter options are set to `false`
    const newFilterState = {
      filterMode: "Show all",
      anyAll: "any",
      filterOptions: Object.fromEntries(
        newFilterOptionKeys.map((filterOption) => [filterOption, false])
      ),
    };

    // calling thunk wrapper since the localStorage needs to be updated
    dispatch(setFilterState(newFilterState));
    dispatch(setIsFiltersUpdatedSnackBarOpen(true));
  };
}

export function refreshTagsInFilterOptions(openSnackBar) {
  return function thunk(dispatch, getState) {
    if (openSnackBar !== true && openSnackBar !== false) {
      throw new Error(
        `Received \`${openSnackBar}\` as value for parameter \`openSnackBar\`. Expected boolean value instead.`
      );
    }

    const oldState = getState().filteringTasks;

    const initialFilterOptionKeys = Object.keys(initialState.filterOptions);
    const tags = selectTags(getState());

    const newFilterOptionKeys = [
      ...initialFilterOptionKeys,
      ...tags.map((tag) => convertTagToFilterOptionKey(tag)),
    ];

    const oldFilterOptionsObject = oldState.filterOptions;
    const newFilterOptionsObject = {};

    // retain as many key-value pairs as possible from old state
    for (const key of newFilterOptionKeys) {
      if (key in oldFilterOptionsObject) {
        newFilterOptionsObject[key] = oldFilterOptionsObject[key];
      } else {
        newFilterOptionsObject[key] = false;
      }
    }

    const newState = {
      filterMode: oldState.filterMode,
      anyAll: oldState.anyAll,
      filterOptions: newFilterOptionsObject,
    };

    dispatch(setFilterState(newState));

    if (openSnackBar === true) {
      dispatch(setIsFiltersUpdatedSnackBarOpen(true));
    }
  };
}

export function renameTagInFilterOptions(oldTagName, newTagName) {
  return function thunk(dispatch, getState) {
    const oldFilterState = getState().filteringTasks;
    const newFilterState = {
      filterMode: oldFilterState.filterMode,
      anyAll: oldFilterState.anyAll,
      filterOptions: {},
    };

    const oldTagName_filterOptionKey = convertTagToFilterOptionKey(oldTagName);
    const newTagName_filterOptionKey = convertTagToFilterOptionKey(newTagName);

    for (const key of Object.keys(oldFilterState.filterOptions)) {
      if (key === oldTagName_filterOptionKey) {
        newFilterState.filterOptions[newTagName_filterOptionKey] =
          oldFilterState.filterOptions[oldTagName_filterOptionKey];
      } else {
        newFilterState.filterOptions[key] = oldFilterState.filterOptions[key];
      }
    }

    dispatch(setFilterState(newFilterState));
  };
}

// ============================================================================
// Helper functions
// ============================================================================

export function convertTagToFilterOptionKey(tag) {
  return `is tagged "${tag}"`;
}

export default filteringTasksSlice.reducer;
