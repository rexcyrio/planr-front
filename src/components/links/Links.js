import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../store/AuthContext";

function Links() {
  const { loggedInUsername: username } = useContext(AuthContext);
  const [link, setLink] = useState("");
  const [error, setError] = useState("NONE");
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch(`/api/private/link?username=${username}`)
      .then((res) => res.json())
      .then((json) => {
        console.log(`json from fetch links is ${json}`);
        console.log(`json.links is ${json.links}`);
        setLinks(json.links);
      });
  }, []);

  const addLinkHandler = () => {
    event.preventDefault();
    if (!link.includes(".com")) {
      setError("INVALID_LINK");
    } else {
      setError("NONE");
    }

    if (error !== "NONE") {
      return;
    }
    setLink("");
    console.log(`${username} sent`);
    console.log(`${link} sent`);
    fetch("/api/private/link", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, link }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setLinks(json.links);
      });
  };

  const openAllLinksHandler = () => {
    links.forEach((link) => {
      window.open(link);
    });
  };

  return (
    <div>
      <div>
        {links.map((link) => (
          <a key={link} href={`${link}`}>
            {link}
          </a>
        ))}
      </div>
      <button onClick={openAllLinksHandler}>Open all</button>
      <form onSubmit={addLinkHandler}>
        <input
          type="text"
          id="link"
          name="link"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          required
        ></input>
        <input type="submit" value="Add" />
      </form>
      {error !== "NONE" ? (
        <span className="red-text">Invalid link!.</span>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Links;
