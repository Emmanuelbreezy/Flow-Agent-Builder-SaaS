import React from "react";

interface HttpSettingsProps {
  id: string;
  data: Record<string, unknown>;
  onUpdate?: (nodeId: string, data: Record<string, unknown>) => void;
}

const HttpSettings = ({ id, data, onUpdate }: HttpSettingsProps) => {
  return <div>HttpSettings</div>;
};

export default HttpSettings;
