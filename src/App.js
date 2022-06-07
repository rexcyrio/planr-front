import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import Login from "./pages/Login";
import NoMatch from "./pages/NoMatch";
import Private from "./pages/Private";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";
import { AuthContext } from "./store/AuthContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const value = {
    isAuthenticated: isAuthenticated,
    loggedInUsername: loggedInUsername,
    userData: userData,
    setLoggedInUsername: setLoggedInUsername,
    setIsAuthenticated: setIsAuthenticated,
    setUserData: setUserData,
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
        setUserData(json.userData);
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
    </AuthContext.Provider>
  );
}

export default App;
//test
