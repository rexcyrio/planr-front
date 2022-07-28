import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ScrollSync } from "react-scroll-sync";
import MyDragLayer from "../components/helperComponents/MyDragLayer";
import Links from "../components/links/Links";
import Notes from "../components/notes/Notes";
import Tasks from "../components/tasks/Tasks";
import Timetable from "../components/timetable/Timetable";
import TimetableNavigator from "../components/timetable/TimetableNavigator";
import TimetableStickyHeader from "../components/timetable/TimetableStickyHeader";

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
              <TimetableNavigator />

              <ScrollSync>
                <div
                  style={{
                    height: "calc(100% - 3rem)",
                    width: "100%",
                  }}
                >
                  <TimetableStickyHeader />
                  <Timetable />
                </div>
              </ScrollSync>
            </div>
          </div>
        </div>
      </DndProvider>
    </>
  );
}

export default Private;
