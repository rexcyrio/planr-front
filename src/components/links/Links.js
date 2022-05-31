import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

Links.propTypes = {
  username: PropTypes.string,
};

function Links(props) {
  console.log(props.username);
  const [link, setLink] = useState("");
  const [error, setError] = useState("NONE");
  const [links, setLinks] = useState([]);

  useEffect(() => {
    fetch(`/api/private/link?username=${props.username}`)
      .then((res) => res.json())
      .then((json) => {
        console.log(json);
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
    console.log(props.username);
    console.log(link);
    fetch("/api/private/link", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: props.username, link }),
    })
      .then((res) => {
        res.json();
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
