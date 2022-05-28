import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";

function Logout() {
  const navigate = useNavigate();
  const { setIsAuthenticated, setLoggedInUsername } = useContext(AuthContext);

  function handleClick() {
    fetch("/logout", {
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
          navigate("/", { replace: true });
        }
      });
  }

  return <button onClick={handleClick}>Log out</button>;
}

export default Logout;
