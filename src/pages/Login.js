import { TextField } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import LoginCarousel from "../components/carousel/LoginCarousel";
import {
  setIsAuthenticated,
  setLoggedInUsername,
  setUserId,
} from "../store/slices/userSlice";

function Login() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
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
          dispatch(setIsAuthenticated(true));
          dispatch(setLoggedInUsername(json.loggedInUsername));
          dispatch(setUserId(json.userId));
          navigate("/private", { replace: true });
        } else {
          setError(true);
          setUsername("");
          setPassword("");
        }
      });
  }

  // ============================================================================
  // Memo functions
  // ============================================================================
  const usernameChangeHandler = useCallback((e) => {
    setError(false);
    setUsername(e.target.value);
  }, []);

  const passwordChangeHandler = useCallback((e) => {
    setError(false);
    setPassword(e.target.value);
  }, []);

  // ============================================================================
  // Memo components
  // ============================================================================
  const loginUsernameTextField = useMemo(
    () => (
      <TextField
        sx={{ mb: "1rem", width: "20rem" }}
        id="username"
        label="Username"
        type="text"
        variant="outlined"
        required
        value={username}
        onChange={usernameChangeHandler}
      />
    ),
    [username, usernameChangeHandler]
  );

  const loginPasswordTextField = useMemo(
    () => (
      <TextField
        sx={{ mb: "1rem", width: "20rem" }}
        id="password"
        label="Password"
        type="password"
        variant="outlined"
        required
        value={password}
        onChange={passwordChangeHandler}
      />
    ),
    [password, passwordChangeHandler]
  );

  const button = useMemo(
    () => (
      <Button sx={{ mb: "1rem" }} type="submit" variant="contained" fullWidth>
        Log in
      </Button>
    ),
    []
  );

  return (
    <>
      <div
        className="hide-scrollbar"
        style={{
          height: "calc(100vh - 3rem - 1px)",
          width: "100vw",
          overflow: "auto",

          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            width: "20rem",
            p: "0 2rem 0.5rem",
            m: "2rem 0",

            display: "flex",
            flexDirection: "column",
            alignItems: "center",

            overflow: "visible",
            height: "fit-content",
          }}
        >
          <h1>Welcome!</h1>
          <Box component="form" onSubmit={handleSubmit}>
            {loginUsernameTextField}
            <br />
            {loginPasswordTextField}
            <br />
            {button}
          </Box>

          <p>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>

          {error ? (
            <Alert severity="error" sx={{ mb: "0.5rem" }}>
              Username or password is incorrect.
            </Alert>
          ) : (
            <></>
          )}
        </Card>
        <div style={{ marginTop: "5rem" }}>
          <LoginCarousel />
        </div>
      </div>
    </>
  );
}

export default Login;
