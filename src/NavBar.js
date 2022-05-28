import React, { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import logo from "./icons/logo.svg";

function NavBar() {
  const { isAuthenticated } = useContext(AuthContext);

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
              <Link to="/logout" className="navbar-buttons">
                Log out
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-buttons">
                Log in
              </Link>
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
