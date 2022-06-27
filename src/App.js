import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import Private from "./pages/Private";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  setIsAuthenticated,
  setLoggedInUsername,
  setUserId,
} from "./store/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";

const theme = createTheme({
  palette: {
    medium: {
      main: "#fce5c4",
    },
    light: {
      main: "#FFF4E4",
    },
    success: {
      main: "#64dd17",
    },
    textBox: {
      main: "#fff",
    },
  },
});

function App() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [loggedInUsername, setLoggedInUsername] = useState(null);
  // const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const value = {
  //   isAuthenticated: isAuthenticated,
  //   loggedInUsername: loggedInUsername,
  //   userId,
  //   setLoggedInUsername: setLoggedInUsername,
  //   setIsAuthenticated: setIsAuthenticated,
  //   setUserId,
  // };

  useEffect(() => {
    fetch("/api/is-authenticated", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((json) => {
        dispatch(setIsAuthenticated(json.isAuthenticated));
        dispatch(setLoggedInUsername(json.loggedInUsername));
        dispatch(setUserId(json.userId));
      })
      .then(() => setIsLoading(false));
  }, []);

  function makePrivate(component) {
    if (user.isAuthenticated) {
      return component;
    } else {
      return <Navigate replace to="/" />;
    }
  }

  function makePublic(component) {
    if (!user.isAuthenticated) {
      return component;
    } else {
      return <Navigate replace to="/" />;
    }
  }

  return isLoading ? (
    <></>
  ) : (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<NavBar />}>
            <Route
              path="/"
              element={
                user.isAuthenticated ? (
                  <Navigate replace to="/private" />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            <Route path="/private" element={makePrivate(<Private />)} />
            <Route path="/login" element={makePublic(<Login />)} />
            <Route path="/signup" element={makePublic(<Signup />)} />
            <Route
              path="/reset-password/:_id/:token"
              element={makePublic(<ResetPassword />)}
            />
            <Route path="*" element={<NoMatch />} status={404} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
//test
