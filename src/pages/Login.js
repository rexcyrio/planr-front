import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { setIsAuthenticated, setLoggedInUsername, setUserData } =
    useContext(AuthContext);
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
        if (res.status === 200) {
          return res.json();
        }
        if (res.status === 401) {
          return { login_success: false };
        }
        return { error: `Error ${res.status}: something went wrong!` };
      })
      .then((json) => {
        if (json.error) {
          alert(json.error);
          return;
        }

        if (json.login_success) {
          setError(false);
          setIsAuthenticated(true);
          setLoggedInUsername(json.loggedInUsername);
          setUserData(json.userData);
          navigate("/private", { replace: true });
        } else {
          setError(true);
          setUsername("");
          setPassword("");
        }
      });
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>Welcome back!</h1>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            sx={{ mb: "1rem", width: "20rem" }}
            id="username"
            label="Username"
            type="text"
            variant="outlined"
            required
            value={username}
            onChange={(e) => {
              setError(false);
              setUsername(e.target.value);
            }}
          />
          <br />
          <TextField
            sx={{ mb: "1rem", width: "20rem" }}
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            required
            value={password}
            onChange={(e) => {
              setError(false);
              setPassword(e.target.value);
            }}
          />
          <br />
          <Button
            sx={{ mb: "1rem" }}
            type="submit"
            variant="contained"
            fullWidth
          >
            Log in
          </Button>
        </Box>

        <p>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>

        {error ? (
          <Alert severity="error" fullWidth>
            Username or password is incorrect.
          </Alert>
        ) : (
          <></>
        )}
      </Box>
    </>
  );
}

export default Login;
