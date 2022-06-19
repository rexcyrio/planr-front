import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../store/AuthContext";

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyPasswordGood, setVerifyPasswordGood] = useState(true);
  const [usernameState, setUsernameState] = useState("NONE");
  const [passwordState, setPasswordState] = useState("NONE");
  const { setIsAuthenticated, setLoggedInUsername, setUserId } =
    useContext(AuthContext);
  const navigate = useNavigate();

  // match A-Z, a-z, 0-9, "_"
  const usernameRegex = /^\w+$/g;

  const usernameStates = {
    NONE: {
      icon: <></>,
      helperText: " ",
      isError: false,
    },

    FETCHING: {
      icon: (
        // padding values needed to align CircularProgress with CheckCircleOutlineIcon
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: "0 0.15rem",
          }}
        >
          <CircularProgress size="1.2rem" />
        </Box>
      ),
      helperText: " ",
      isError: false,
    },

    ALL_GOOD: {
      icon: (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CheckCircleOutlineIcon sx={{ color: "green" }} />
        </Box>
      ),
      helperText: " ",
      isError: false,
    },

    USERNAME_ALREADY_IN_USE: {
      icon: <></>,
      helperText: "Please choose another username",
      isError: true,
    },

    USERNAME_INCORRECT_FORMAT: {
      icon: <></>,
      helperText: "Only A-Z, a-z, 0-9 and _ (underscore) is allowed",
      isError: true,
    },
  };

  const passwordStates = {
    NONE: {
      helperText: " ",
      isError: false,
    },
    ALL_GOOD: {
      helperText: " ",
      isError: false,
    },

    PASSWORD_TOO_SHORT: {
      helperText: "Minimum of 6 characters required for password",
      isError: true,
    },

    MISSING_NUMBER_OR_LETTER: {
      helperText: "Password requires at least 1 letter and number",
      isError: true,
    },
  };

  async function isUsernameAvailable(username) {
    const res = await fetch("/api/is-username-available", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });

    const json = await res.json();

    if (json.error) {
      alert(json.error);
    } else {
      return json.isAvailable;
    }
  }

  async function handleUsernameChange(event) {
    const newUsername = event.target.value;
    setUsername(newUsername);

    if (newUsername === "") {
      setUsernameState("NONE");
      return;
    }

    if (!newUsername.match(usernameRegex)) {
      setUsernameState("USERNAME_INCORRECT_FORMAT");
      return;
    }

    setUsernameState("FETCHING");

    if (await isUsernameAvailable(newUsername)) {
      setUsernameState("ALL_GOOD");
    } else {
      setUsernameState("USERNAME_ALREADY_IN_USE");
    }
  }

  function handlePasswordChange(event) {
    const newPassword = event.target.value;
    setPassword(newPassword);

    if (newPassword === "") {
      setUsernameState("NONE");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordState("PASSWORD_TOO_SHORT");
      return;
    }

    let hasLetter = false;
    let hasNumber = false;
    let lowerCasePassword = newPassword.toLowerCase();

    for (let i = 0; i < newPassword.length; i++) {
      if (
        lowerCasePassword.charCodeAt(i) > 96 &&
        lowerCasePassword.charCodeAt(i) < 123
      ) {
        hasLetter = true;
        break;
      }
    }

    for (let i = 0; i < newPassword.length; i++) {
      if (
        lowerCasePassword.charCodeAt(i) > 47 &&
        lowerCasePassword.charCodeAt(i) < 58
      ) {
        hasNumber = true;
        break;
      }
    }

    if (hasNumber && hasLetter) {
      setPasswordState("ALL_GOOD");
      return;
    }

    setPasswordState("MISSING_NUMBER_OR_LETTER");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (passwordState !== "ALL_GOOD") {
      return;
    }

    if (password !== verifyPassword) {
      setVerifyPasswordGood(false);
      return;
    }

    if (!(await isUsernameAvailable(username))) {
      return;
    }

    fetch("/api/signup", {
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

        autoLogin();
      });
  }

  function autoLogin() {
    fetch("/api/login", {
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
          setUserId(json.userId);
          navigate("/private", { replace: true });
        } else {
          alert(json.error);
        }
      });
  }

  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h1>Create a new account</h1>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            sx={{ mb: "1rem", width: "20rem" }}
            id="username"
            label="Username"
            type="text"
            variant="outlined"
            required
            value={username}
            onChange={handleUsernameChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  {usernameStates[usernameState].icon}
                </InputAdornment>
              ),
            }}
            helperText={usernameStates[usernameState].helperText}
            error={usernameStates[usernameState].isError}
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
            onChange={handlePasswordChange}
            helperText={passwordStates[passwordState].helperText}
            error={passwordStates[passwordState].isError}
          />
          <br />
          <TextField
            sx={{ mb: "1rem", width: "20rem" }}
            id="verifyPassword"
            label="verify password"
            type="password"
            variant="outlined"
            required
            value={verifyPassword}
            onFocus={() => {
              setVerifyPasswordGood(true);
            }}
            onChange={(e) => setVerifyPassword(e.target.value)}
            helperText={verifyPasswordGood ? " " : "Passwords do not match"}
            error={!verifyPasswordGood}
          />
          <br />
          <Button
            sx={{ mb: "1rem" }}
            type="submit"
            variant="contained"
            fullWidth
          >
            Sign up
          </Button>
        </Box>

        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Box>
    </>
  );
}

export default Signup;
