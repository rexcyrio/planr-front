import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import checkmarkIcon from "./icons/icons8-checkmark-yes-32.png";
import loadingIcon from "./icons/icons8-loading-circle.gif";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("NONE");
  const { setIsAuthenticated, setLoggedInUsername } = useContext(AuthContext);
  const navigate = useNavigate();

  // match A-Z, a-z, 0-9, "_"
  const usernameRegex = /^\w+$/g;
  const allErrors = {
    NONE: <></>,
    FETCHING: (
      <img src={loadingIcon} alt="Loading..." className="icon-beside-input" />
    ),
    ALL_GOOD: (
      <img src={checkmarkIcon} alt="All good!" className="icon-beside-input" />
    ),
    USERNAME_ALREADY_IN_USE: (
      <span className="red-text text-beside-input">
        Please choose another username
      </span>
    ),
    USERNAME_INCORRECT_FORMAT: (
      <span className="red-text text-beside-input">
        Only A-Z, a-z, 0-9 and _ (underscore) is allowed
      </span>
    ),
  };

  async function handleUsernameChange(event) {
    const newUsername = event.target.value;
    setUsername(newUsername);

    if (newUsername === "") {
      setError("NONE");
      return;
    }

    if (!newUsername.match(usernameRegex)) {
      setError("USERNAME_INCORRECT_FORMAT");
      return;
    }

    setError("FETCHING");

    fetch("/is-username-available", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: newUsername }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        if (json.isAvailable) {
          setError("ALL_GOOD");
        } else {
          setError("USERNAME_ALREADY_IN_USE");
        }
      });
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (error !== "ALL_GOOD") {
      return;
    }

    fetch("/signup", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        if (json.signup_success) {
          autoLogin();
        } else {
          alert("Sign up for new user failed.");
        }
      });
  }

  function autoLogin() {
    fetch("/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.login_success) {
          setIsAuthenticated(true);
          setLoggedInUsername(json.loggedInUsername);
          navigate("/private", { replace: true });
        } else {
          alert(json.error);
        }
      });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="signup_username">Username</label>
      <br />
      <input
        type="text"
        id="signup_username"
        name="signup_username"
        value={username}
        onChange={handleUsernameChange}
        required
      />
      {allErrors[error]}

      <br />
      <label htmlFor="signup_password">Password</label>
      <br />
      <input
        type="password"
        id="signup_password"
        name="signup_password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <input type="submit" value="Sign up" />
    </form>
  );
}

export default Signup;
