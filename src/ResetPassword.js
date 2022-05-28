import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { _id, token } = useParams();
  const [display, setDisplay] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/verify-password-reset-credentials", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ _id: _id, token: token }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          alert(json.error.message);
          navigate("/", { replace: true });
          return;
        }
        if (json.isPasswordResetCredentialsVerified) {
          setDisplay(true);
        }
      });
  }, []);

  function isPasswordMatched() {
    if (
      newPassword !== "" &&
      confirmPassword !== "" &&
      newPassword === confirmPassword
    ) {
      return true;
    }
    return false;
  }

  function handleSubmit() {
    if (!isPasswordMatched()) {
      return;
    }

    fetch();
  }

  return (
    <>
      {display ? (
        <>
          <h1>This is the reset password page.</h1>
          <h2>
            _id={_id}, token={token}
          </h2>
          <form on onSubmit={handleSubmit}>
            <label htmlFor="newPassword">New Password:</label>
            <br />
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <br />
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <br />
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <br />
            {isPasswordMatched() ? (
              <></>
            ) : (
              <span className="red-text">Password mismatch</span>
            )}
            <input type="submit" value="Reset Password" />
          </form>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default ResetPassword;
