"use client";

import { JsonView } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface JsonViewerProps {
  data: any;
  className?: string;
}

export function JsonViewerComponent({ data, className }: JsonViewerProps) {
  try {
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return (
      <div className={`json-viewer ${className || ""}`}>
        <JsonView 
          data={parsed} 
          shouldExpandNode={(level: number) => level < 2}
        />
      </div>
    );
  } catch {
    return (
      <pre className={`${className || ""} overflow-auto`}>
        <code className="text-sm font-mono">{typeof data === "string" ? data : JSON.stringify(data, null, 2)}</code>
      </pre>
    );
  }
}

