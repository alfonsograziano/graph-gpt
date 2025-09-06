"use client";

import React from "react";
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";

type ActiveEdgeProps = EdgeProps;

export const ActiveEdge: React.FC<ActiveEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const isActive = data?.isActive || false;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle = {
    ...style,
    stroke: isActive ? "#3b82f6" : "#9ca3af", // blue-500 for active, gray-400 for inactive
    strokeWidth: 2,
    filter: isActive ? "drop-shadow(0 0 2px rgba(59, 130, 246, 0.2))" : "none",
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        {...(isActive ? { "data-animate": "pulse" } : {})}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {/* Edge label content can go here if needed */}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
