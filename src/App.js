import { createTheme, ThemeProvider } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import Private from "./pages/Private";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import {
  setIsAuthenticated,
  setLoggedInUsername,
  setUserId,
} from "./store/slices/userSlice";

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
  const { isAuthenticated } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

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
    if (isAuthenticated) {
      return component;
    } else {
      return <Navigate replace to="/" />;
    }
  }

  function makePublic(component) {
    if (!isAuthenticated) {
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
                isAuthenticated ? (
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
