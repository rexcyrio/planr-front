import React, { useEffect, useState } from "react";
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
import { useDispatch } from "react-redux";
import { fetchPermLinks } from "../store/slices/linksSlice";
import { fetchNotes } from "../store/slices/notesSlice";
import { useMediaQuery } from "react-responsive";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

function Private() {
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 88em)" });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPermLinks());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const closeDrawerHandler = () => setIsDrawerOpen(false);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <MyDragLayer />
        <div className="background">
          <div className="grid">
            {!isSmallScreen ? (
              <>
                <div
                  className="links-section"
                  style={{
                    borderBottomRightRadius: "5px",
                  }}
                >
                  <Links />
                </div>
                <div
                  className="notes-section"
                  style={{
                    borderTopRightRadius: "5px",
                  }}
                >
                  <Notes />
                </div>
              </>
            ) : (
              <div className="drawer-section">
                <Tooltip
                  title="Open links and notes"
                  placement="right"
                  followCursor={true}
                >
                  <IconButton
                    size="small"
                    sx={{
                      padding: "0",
                      width: "1.25rem",
                      height: "100%",
                      backgroundColor: "beige",
                      borderRadius: "0",
                    }}
                    onClick={() => setIsDrawerOpen((prev) => !prev)}
                  >
                    <ArrowForwardIosIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Drawer
                  open={isDrawerOpen}
                  onClose={closeDrawerHandler}
                  sx={{ overflow: "hidden" }}
                  ModalProps={{
                    keepMounted: true,
                  }}
                >
                  <div style={{ height: "calc(3rem + 1px)" }} />
                  <div
                    style={{
                      maxWidth: "25rem",
                      height: "calc(100vh - 3rem - 1px)",
                    }}
                  >
                    <div style={{ height: "40%" }}>
                      <Links />
                    </div>
                    <Divider />
                    <div style={{ height: "calc(60% - 1px)" }}>
                      <Notes />
                    </div>
                  </div>
                </Drawer>
              </div>
            )}
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
