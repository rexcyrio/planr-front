import React from "react";
import { useDragLayer } from "react-dnd";

function getDragLayerStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }

  const { x, y } = currentOffset;
  const transform = `translate(${x + 20}px, ${y + 20}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

function MyDragLayer() {
  const { item, itemType, isDragging, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
    }));

  if (!isDragging) {
    return null;
  }

  function renderItem() {
    switch (itemType) {
      case "TASK":
        return (
          <div
            style={{
              height: "auto",
              width: "7rem",
              padding: "0.5rem",
              border: "1px solid grey",
              borderRadius: "5px",
              backgroundColor: "hsl(0, 0%, 98%)",
              wordBreak: "break-word",
            }}
          >
            {item.task.name}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div
      style={{
        height: "0",
        width: "0",
        position: "absolute",
        top: "0",
        left: "0",
        pointerEvents: "none",
        zIndex: "100",
      }}
    >
      <div style={getDragLayerStyles(initialOffset, currentOffset)}>
        {renderItem()}
      </div>
    </div>
  );
}

export default MyDragLayer;
