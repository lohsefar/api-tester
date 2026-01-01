"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface WebhookItemProps {
  webhook: {
    id: string;
    method: string;
    receivedAt: Date | string;
    ip?: string | null;
    body?: string | null;
  };
  isSelected: boolean;
  onClick: () => void;
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  POST: "bg-green-500/20 text-green-400 border-green-500/30",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function WebhookItem({ webhook, isSelected, onClick }: WebhookItemProps) {
  const methodColor = methodColors[webhook.method] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const size = webhook.body ? `${(webhook.body.length / 1024).toFixed(1)} kB` : "0 kB";
  const receivedAt = typeof webhook.receivedAt === "string" 
    ? new Date(webhook.receivedAt) 
    : webhook.receivedAt;

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 border-b border-border cursor-pointer transition-colors hover:bg-accent/50",
        isSelected && "bg-accent"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge className={cn("text-xs font-mono", methodColor)}>
          {webhook.method}
        </Badge>
        <span className="text-xs text-muted-foreground font-mono">
          #{webhook.id.slice(0, 6)}
        </span>
        {webhook.ip && (
          <span className="text-xs text-muted-foreground">
            {webhook.ip}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(receivedAt, { addSuffix: true })}</span>
        <span>{size}</span>
      </div>
    </div>
  );
}

