import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Links from "../components/links/Links";
import Notes from "../components/notes/Notes";
import Scheduler from "../components/scheduler/Scheduler";

function Private() {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="background">
          <div className="grid">
            <div className="links-section">
              <Links />
            </div>
            <div className="notes-section">
              <Notes />
            </div>
            <Scheduler />
          </div>
        </div>
      </DndProvider>
    </>
  );
}

export default Private;
