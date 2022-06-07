import React from "react";
import Links from "../components/Links";
import Notes from "../components/Notes";
import Tasks from "../components/Tasks";
import Timetable from "../components/Timetable";

function Private() {
  return (
    <>
      <div className="background">
        <div className="grid">
          <div className="links-section">
            <Links />
          </div>
          <div className="notes-section">
            <Notes />
          </div>
          <div className="tasks-section">
            <Tasks />
          </div>
          <div className="timetable-section">
            <Timetable />
          </div>
        </div>
      </div>
    </>
  );
}

export default Private;
