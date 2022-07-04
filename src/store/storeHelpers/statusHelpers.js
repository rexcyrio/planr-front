import {
  FETCHING,
  FETCH_FAILURE,
  FETCH_SUCCESS,
  UPDATE_FAILURE,
  UPDATE_SUCCESS,
  UPDATING,
} from "../../components/helperComponents/DataStatus";

export const FETCHING_REDUCER = (state) => {
  state.status = FETCHING;
  return state;
};

export const UPDATING_REDUCER = (state) => {
  state.status = UPDATING;
  return state;
};

export const FETCH_SUCCESS_REDUCER = (state) => {
  state.status = FETCH_SUCCESS;
  return state;
};

export const UPDATE_SUCCESS_REDUCER = (state) => {
  state.status = UPDATE_SUCCESS;
  return state;
};

export const FETCH_FAILURE_REDUCER = (state) => {
  state.status = FETCH_FAILURE;
  return state;
};

export const UPDATE_FAILURE_REDUCER = (state) => {
  state.status = UPDATE_FAILURE;
  return state;
};
