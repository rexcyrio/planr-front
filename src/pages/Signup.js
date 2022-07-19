import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setIsNewUser } from "../store/slices/isNewUserSlice";
import {
  setIsAuthenticated,
  setLoggedInUsername,
  setUserId,
} from "../store/slices/userSlice";

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

function Signup() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [verifyPasswordGood, setVerifyPasswordGood] = useState(true);
  const [usernameState, setUsernameState] = useState("NONE");
  const [passwordState, setPasswordState] = useState("NONE");
  const navigate = useNavigate();

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
          dispatch(setIsAuthenticated(true));
          dispatch(setLoggedInUsername(json.loggedInUsername));
          dispatch(setUserId(json.userId));
          dispatch(setIsNewUser(true));
          navigate("/private", { replace: true });
        } else {
          alert(json.error);
        }
      });
  }

  // ============================================================================
  // Memo functions
  // ============================================================================
  const verifyPasswordChangeHandler = useCallback((e) => {
    setVerifyPassword(e.target.value);
  }, []);

  const verifyPasswordFocusHandler = useCallback(() => {
    setVerifyPasswordGood(true);
  }, []);

  const handleUsernameChange = useCallback(async (event) => {
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
  }, []);

  const handlePasswordChange = useCallback((event) => {
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
  }, []);

  // ============================================================================
  // Memo components
  // ============================================================================
  const signupUsernameTextField = useMemo(
    () => (
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
    ),
    [username, handleUsernameChange, usernameState]
  );

  const signupPasswordTextField = useMemo(
    () => (
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
    ),
    [password, handlePasswordChange, passwordState]
  );

  const signupVerifyPasswordTextField = useMemo(
    () => (
      <TextField
        sx={{ mb: "1rem", width: "20rem" }}
        id="verifyPassword"
        label="Verify Password"
        type="password"
        variant="outlined"
        required
        value={verifyPassword}
        onFocus={verifyPasswordFocusHandler}
        onChange={verifyPasswordChangeHandler}
        helperText={verifyPasswordGood ? " " : "Passwords do not match"}
        error={!verifyPasswordGood}
      />
    ),
    [
      verifyPassword,
      verifyPasswordChangeHandler,
      verifyPasswordFocusHandler,
      verifyPasswordGood,
    ]
  );

  const signupButton = useMemo(
    () => (
      <Button sx={{ mb: "1rem" }} type="submit" variant="contained" fullWidth>
        Sign up
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
          justifyContent: "center",
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
          <h1>Create a new account</h1>
          <Box component="form" onSubmit={handleSubmit}>
            {signupUsernameTextField}
            <br />
            {signupPasswordTextField}
            <br />
            {signupVerifyPasswordTextField}
            <br />
            {signupButton}
          </Box>

          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </Card>
      </div>
    </>
  );
}

export default Signup;
