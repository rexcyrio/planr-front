import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";

function Private() {
  const { loggedInUsername } = useContext(AuthContext);
  return (
    <>
      <h1>Welcome {loggedInUsername}!</h1>
      <h2>This is the private page.</h2>
    </>
  );
}

export default Private;
