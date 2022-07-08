import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MyDragLayer from "../components/helperComponents/MyDragLayer";
import Links from "../components/links/Links";
import Notes from "../components/notes/Notes";
import Tasks from "../components/tasks/Tasks";
import Timetable from "../components/timetable/Timetable";

function Private() {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <MyDragLayer />
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
      </DndProvider>
    </>
  );
}

export default Private;
