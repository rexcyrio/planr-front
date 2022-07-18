import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import React, { useState } from "react";
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

  return (
    <>
      <div
        style={{
          height: "calc(100vh - 3rem - 1px - 2.8rem * 2)",
          width: "100vw",
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.8rem 0",

        }}
      >
        <Card
          sx={{
            width: "20rem",
            p: "0 2rem 0.5rem",
          }}
        >
          <h1>Welcome back!</h1>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              sx={{ mb: "1rem", width: "20rem", backgroundColor: "#fff" }}
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
            <Alert severity="error">Username or password is incorrect.</Alert>
          ) : (
            <></>
          )}
        </Card>
        <div style={{ marginTop: "10rem" }}>
          <LoginCarousel />
        </div>
      </div>
    </>
  );
}

export default Login;
