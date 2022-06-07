import React from "react";

export const AuthContext = React.createContext({
  isAuthenticated: false,
  loggedInUsername: null,
  userData: null,
  setIsAuthenticated: () => {},
  setLoggedInUsername: () => {},
  setUserData: () => {},
});
