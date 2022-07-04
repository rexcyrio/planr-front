////////////////////////////////////////////////////////////////////////////////
// Case reducers
////////////////////////////////////////////////////////////////////////////////

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
};

export const UPDATING_REDUCER = (state) => {
  state.status = UPDATING;
};

export const FETCH_SUCCESS_REDUCER = (state) => {
  state.status = FETCH_SUCCESS;
};

export const UPDATE_SUCCESS_REDUCER = (state) => {
  state.status = UPDATE_SUCCESS;
};

export const FETCH_FAILURE_REDUCER = (state) => {
  state.status = FETCH_FAILURE;
};

export const UPDATE_FAILURE_REDUCER = (state) => {
  state.status = UPDATE_FAILURE;
};
