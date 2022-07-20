import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import MyDragLayer from "../components/helperComponents/MyDragLayer";
import Links from "../components/links/Links";
import Notes from "../components/notes/Notes";
import Tasks from "../components/tasks/Tasks";
import LineMarker from "../components/timetable/LineMarker";
import Timetable from "../components/timetable/Timetable";
import TimetableBackground from "../components/timetable/TimetableBackground";
import TimetableNavigator from "../components/timetable/TimetableNavigator";
import styles from "../components/timetable/Timetable.module.css";
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
              <TimetableStickyHeader/>

              <div className={styles["timetable-container"]}>
                <TimetableBackground />
                <LineMarker />

                <Timetable />
              </div>
            </div>
          </div>
        </div>
      </DndProvider>
    </>
  );
}

export default Private;
