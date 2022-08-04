import React from "react";
import { ScrollSyncPane } from "react-scroll-sync";
import LineMarker from "./LineMarker";
import TimetableBackground from "./TimetableBackground";
import TimetableCell from "./TimetableCell";
import TimetableTimeColumn from "./TimetableTimeColumn";

const dummyMatrix = new Array(48).fill(0);

function Timetable() {
  return (
    <div
      style={{
        height: "calc(100% - 1.4rem)",
        width: "100%",
        display: "flex",
      }}
    >
      <TimetableTimeColumn />

      <ScrollSyncPane group={["horizontal", "vertical"]}>
        <div
          className="hide-scrollbar"
          style={{
            height: "100%",
            width: "calc(100% - 6rem)",
            flexShrink: "0",
            overflow: "auto",
          }}
        >
          <LineMarker />

          <div style={{ width: "41.9rem", position: "relative" }}>
            <TimetableBackground />

            <table
              style={{
                borderCollapse: "collapse",
                marginBottom: "1rem",
              }}
            >
              <tbody>
                {dummyMatrix.map((_, row) => (
                  <tr key={row} style={{ height: "1.375rem" }}>
                    {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                      <React.Fragment key={`${row},${col}`}>
                        <TimetableCell row={row} col={col} />
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollSyncPane>
    </div>
  );
}

export default React.memo(Timetable);
