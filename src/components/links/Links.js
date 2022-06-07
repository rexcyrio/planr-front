import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../store/AuthContext";

function Links() {
  const { loggedInUsername: username } = useContext(AuthContext);
  const [link, setLink] = useState("https://");
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
    setError("NONE");
    if (!link.includes(".com")) {
      setError("INVALID_LINK");
      return;
    } else if (links.includes(link)) {
      setError("DUPLICATE");
      return;
    }

    setLink("https://");
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
    links.forEach((link, idx) => {
      window.open(link, `${idx}`, "popup=false");
    });
  };

  const removeLinkHandler = (link) => {
    fetch(`/api/private/link?username=${username}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ link }),
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        setLinks(json.links);
      });
  };

  const errorMessage = () => {
    switch (error) {
      case "INVALID_LINK":
        return <span>Invalid link!.</span>;
      case "DUPLICATE":
        return <span>Duplicate link!.</span>;
      case "NONE":
        return <></>;
    }
  };

  return (
    <div>
      <div>
        {links.map((link) => (
          <div key={link}>
            <a href={`${link}`}>{link}</a>
            <button onClick={() => removeLinkHandler(link)}>remove</button>
          </div>
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
      {errorMessage()}
    </div>
  );
}

export default Links;
