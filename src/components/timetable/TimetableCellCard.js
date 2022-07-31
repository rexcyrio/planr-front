import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Card from "@mui/material/Card";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { selfPropTypes } from "../../helper/selfPropTypesHelper";
import { getBackgroundColour } from "../../helper/themeHelper";
import {
  blackenCells,
  refreshMatrix,
  setMatrix,
} from "../../store/slices/matrixSlice";
import { updateTaskFields } from "../../store/slices/tasksSlice";
import DetailsPopover from "./DetailsPopover";

TimetableCellCard.propTypes = {
  self: selfPropTypes,
};

function TimetableCellCard({ self }) {
  const dispatch = useDispatch();
  const themeName = useSelector((state) => state.themeName);
  const mappingTagToColourName = useSelector(
    (state) => state.mappingTagToColourName
  );
  const mondayKey = useSelector((state) => state.time.mondayKey);
  const devicePixelRatio = useSelector((state) => state.devicePixelRatio);
  const [isMouseOver, setIsMouseOver] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsMouseOver(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsMouseOver(false);
  }, []);

  const getCardHeight = useCallback(() => {
    if (devicePixelRatio < 2) {
      return `${(1.3125 + 1 / 16) * self.timeUnits - 0.1875}rem`;
    }

    if (devicePixelRatio >= 2) {
      return `${(1.3125 + 1 / 32) * self.timeUnits - 0.1875}rem`;
    }
  }, [devicePixelRatio, self.timeUnits]);

  const memoDragIndicatorIcon = useMemo(
    () => (
      <DragIndicatorIcon fontSize="inherit" sx={{ color: "hsl(0, 0%, 25%)" }} />
    ),
    []
  );

  const [, drag, preview] = useDrag(
    () => ({
      type: "TASK",
      item: () => {
        setTimeout(() => {
          const { row, col, timeUnits } = self;

          // temporarily set taskId to "0"
          const values = [];

          for (let i = 0; i < timeUnits; i++) {
            values.push([row + i, col, "0"]);
          }

          dispatch(setMatrix(values));

          dispatch(
            updateTaskFields(self._id, {
              row: -1,
              col: -1,
            })
          );

          if (self.dueDate === "--") {
            dispatch(blackenCells());
          }
        }, 0);

        return { task: self };
      },
      end: (item, monitor) => {
        const { dueDate } = item.task;

        if (dueDate === "--") {
          dispatch(refreshMatrix());
        }
      },
    }),
    [self]
  );

  // needed for custom drag layer
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <>
      <Card
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          backgroundColor: getBackgroundColour(
            themeName,
            mappingTagToColourName,
            self,
            mondayKey
          ),
          margin: 0,
          height: getCardHeight(),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {isModuleItem(self) ? (
            <div
              style={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                paddingLeft: "0.25rem",
              }}
            >
              {self.tag}
            </div>
          ) : (
            <div
              title="Move task around"
              ref={drag}
              style={{
                width: "fit-content",
                cursor: "grab",
                visibility: isMouseOver ? "visible" : "hidden",
                fontSize: "0.95rem",
              }}
            >
              {memoDragIndicatorIcon}
            </div>
          )}
          <DetailsPopover self={self} />
        </div>

        <div
          title={self.name}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: `${self.timeUnits - 1}`,
            overflow: "hidden",
            width: "auto",
            maxWidth: "5.55rem",
            paddingLeft: "0.25rem",
          }}
        >
          {self.name}
        </div>
      </Card>
    </>
  );
}

function isModuleItem(self) {
  return self._id.slice(0, 2) === "__";
}

export default React.memo(TimetableCellCard);
