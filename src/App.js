import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import Home from "./Home";
import Login from "./Login";
import Logout from "./Logout";
import NavBar from "./NavBar";
import NoMatch from "./NoMatch";
import Private from "./Private";
import ResetPassword from "./ResetPassword";
import Signup from "./Signup";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loggedInUsername, setLoggedInUsername] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const value = {
        isAuthenticated: isAuthenticated,
        loggedInUsername: loggedInUsername,
        setLoggedInUsername: setLoggedInUsername,
        setIsAuthenticated: setIsAuthenticated,
    };

    useEffect(() => {
        fetch("/is-authenticated", {
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
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/private"
                            element={makePrivate(<Private />)}
                        />
                        <Route
                            path="/logout"
                            element={makePrivate(<Logout />)}
                        />
                        <Route path="/login" element={makePublic(<Login />)} />
                        <Route
                            path="/signup"
                            element={makePublic(<Signup />)}
                        />
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
