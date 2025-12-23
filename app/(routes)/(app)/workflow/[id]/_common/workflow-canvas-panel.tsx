import React from "react";
import { Node } from "@xyflow/react";
import { NodePanel } from "./node-panel";
import { SettingPanel } from "./setting-panel";

const WorkflowCanvasPanel = ({
  selectedNode,
}: {
  selectedNode: Node | null;
}) => {
  return (
    <>
      <NodePanel />
      <SettingPanel selectedNode={selectedNode} />
    </>
  );
};

export default WorkflowCanvasPanel;
