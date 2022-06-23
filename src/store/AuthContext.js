import React from "react";

export const AuthContext = React.createContext({
  isAuthenticated: false,
  loggedInUsername: null,
  userId: null,
  setIsAuthenticated: () => {},
  setLoggedInUsername: () => {},
  setUserId: () => {},
});
