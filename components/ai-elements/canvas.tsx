import { Background, ReactFlow, type ReactFlowProps } from "@xyflow/react";
import type { ReactNode } from "react";
import "@xyflow/react/dist/style.css";

type CanvasProps = ReactFlowProps & {
  children?: ReactNode;
  panOnDrag?: boolean;
  selectionOnDrag?: boolean;
  panOnScroll?: boolean;
  disabled?: boolean;
};

export const Canvas = ({
  children,
  panOnDrag,
  selectionOnDrag,
  disabled,
  ...props
}: CanvasProps) => {
  return (
    <ReactFlow
      deleteKeyCode={disabled ? null : ["Backspace", "Delete"]}
      fitView
      panOnDrag={panOnDrag}
      selectionOnDrag={selectionOnDrag}
      panOnScroll={!disabled}
      zoomOnDoubleClick={false}
      zoomOnScroll={!disabled}
      zoomOnPinch={!disabled}
      nodesDraggable={!disabled}
      nodesConnectable={!disabled}
      elementsSelectable={!disabled}
      disableKeyboardA11y={disabled}
      {...props}
    >
      <Background bgColor="var(--sidebar)" />
      {children}
    </ReactFlow>
  );
};
