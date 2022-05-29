import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { setIsAuthenticated, setLoggedInUsername } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();

    fetch("/api/login", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((res) => {
        console.log(res);
        if (res.status === 401) {
          console.log("failed");
        } else if (res.status === 200) {
          return res.json();
        } else {
          console.log("others");
        }
      })
      .then((json) => {
        console.log(json);
        if (json.login_success) {
          console.log(true);
          setError(false);
          setIsAuthenticated(true);
          setLoggedInUsername(json.loggedInUsername);
          navigate("/private", { replace: true });
        } else {
          console.log(false);
          setError(true);
          setIsAuthenticated(false);
          setLoggedInUsername(null);
        }
      });
  }

  return (
    <>
      <h1>Welcome back!</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="login_username">Username</label>
        <br />
        <input
          type="text"
          id="login_username"
          name="login_username"
          value={username}
          onChange={(e) => {
            setError(false);
            setUsername(e.target.value);
          }}
          required
        />
        <br />
        <label htmlFor="login_password">Password</label>
        <br />
        <input
          type="password"
          id="login_password"
          name="login_password"
          value={password}
          onChange={(e) => {
            setError(false);
            setPassword(e.target.value);
          }}
          required
        />
        <br />
        <input type="submit" value="Log in" />
      </form>
      {error ? (
        <span className="red-text">Username or password incorrect.</span>
      ) : (
        <></>
      )}
    </>
  );
}

export default Login;
