import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  setIsAuthenticated,
  setLoggedInUsername,
  setUserId,
} from "../../store/slices/userSlice";
import Settings from "../settings/Settings";
import logo from "./../../icons/logo.svg";
import styles from "./NavBar.module.css";

function NavBar() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();

  function logoutNow(event) {
    event.preventDefault();

    fetch("/api/logout", {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        dispatch(setIsAuthenticated(false));
        dispatch(setLoggedInUsername(null));
        dispatch(setUserId(null));
        navigate("/login", { replace: true });
      });
  }

  return (
    <>
      <nav className="navbar">
        <Link to="/">
          <div className="logo-wrapper">
            <img src={logo} alt="PlanR Logo" className="logo" />
            <div className="nunito logo-text">PlanR</div>
          </div>
        </Link>

        <div className={styles.utility}>
          {isAuthenticated && <Settings />}

          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isAuthenticated ? (
              <Button sx={{ mr: "1rem" }} onClick={logoutNow}>
                Log out
              </Button>
            ) : (
              <Link to="/signup">
                <Button sx={{ mr: "1rem" }} variant="contained">
                  Sign up
                </Button>
              </Link>
            )}
          </Box>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default NavBar;
