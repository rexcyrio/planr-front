import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import React, { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../store/AuthContext";
import Settings from "../settings/Settings";
import logo from "./../../icons/logo.svg";
import styles from "./NavBar.module.css";

function NavBar() {
  const { isAuthenticated, setIsAuthenticated, setLoggedInUsername } =
    useContext(AuthContext);
  const navigate = useNavigate();

  function logoutNow(e) {
    e.preventDefault();

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
        if (json.logout_success) {
          setIsAuthenticated(false);
          setLoggedInUsername(null);
          navigate("/login", { replace: true });
        }
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
        <div className={styles.ultility}>
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
