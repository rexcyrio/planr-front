import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import Private from "./pages/Private";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import { AuthContext } from "./store/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    success: {
      main: "#64dd17",
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const value = {
    isAuthenticated: isAuthenticated,
    loggedInUsername: loggedInUsername,
    userId,
    setLoggedInUsername: setLoggedInUsername,
    setIsAuthenticated: setIsAuthenticated,
    setUserId,
  };

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
        setIsAuthenticated(json.isAuthenticated);
        setLoggedInUsername(json.loggedInUsername);
        setUserId(json.userId);
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
    <AuthContext.Provider value={value}>
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
    </AuthContext.Provider>
  );
}

export default App;
//test
