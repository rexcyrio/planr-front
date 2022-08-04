import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Snackbar from "@mui/material/Snackbar";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsFiltersUpdatedSnackBarOpen } from "../../store/slices/isFiltersUpdatedSnackBarOpenSlice";

function FiltersUpdatedSnackBar() {
  const dispatch = useDispatch();
  const isFiltersUpdatedSnackBarOpen = useSelector(
    (state) => state.isFiltersUpdatedSnackBarOpen
  );

  const handleClose = useCallback(() => {
    dispatch(setIsFiltersUpdatedSnackBarOpen(false));
  }, [dispatch]);

  return (
    <Snackbar
      open={isFiltersUpdatedSnackBarOpen}
      autoHideDuration={6000}
      onClose={handleClose}
      message="Filters updated"
      action={
        <IconButton onClick={handleClose} color="inherit">
          <CloseIcon />
        </IconButton>
      }
    />
  );
}

export default React.memo(FiltersUpdatedSnackBar);
