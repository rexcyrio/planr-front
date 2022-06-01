import React, { useContext } from "react";
import Links from "../components/links/Links";
import { AuthContext } from "../store/AuthContext";

function Private() {
  const { loggedInUsername } = useContext(AuthContext);
  return (
    <>
      <h1>Welcome {loggedInUsername}!</h1>
      <h2>This is the private page.</h2>
      <Links />
    </>
  );
}

export default Private;
