import React, { useState } from "react";

function Movies() {
    const [data, setData] = useState("empty");
    const [query, setQuery] = useState("");

    function handleSubmit(event) {
        event.preventDefault();

        fetch("/movies", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: query }),
        })
            .then((res) => res.json())
            .then((json) => {
                if (json.error) {
                    alert(json.error);
                    return;
                }

                if (Object.keys(json).length === 0) {
                    setData("unknown");
                } else {
                    setData(json.title);
                }
            });
    }

    return (
        <>
            <h1>data is {data}</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="query">Search for movie: </label>
                <input
                    type="text"
                    id="query"
                    name="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <input type="submit" value="Go" />
            </form>
        </>
    );
}

export default Movies;
