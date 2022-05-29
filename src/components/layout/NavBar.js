import React, { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../store/AuthContext";
import logo from "./../../icons/logo.svg";

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
      .then((res) => {
        console.log(res);
        return res.json();
      })
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

        <div className="navbar-buttons-container">
          {isAuthenticated ? (
            <>
              <Link to="/private" className="navbar-buttons">
                Private
              </Link>
              <Link to="/login" className="navbar-buttons" onClick={logoutNow}>
                Log out
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup" className="navbar-buttons">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </>
  );
}

export default NavBar;
