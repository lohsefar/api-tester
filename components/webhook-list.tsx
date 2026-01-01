"use client";

import { useEffect, useState } from "react";
import { WebhookItem } from "./webhook-item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Webhook {
  id: string;
  method: string;
  receivedAt: Date | string;
  ip?: string | null;
  body?: string | null;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
}

export function WebhookList({
  endpointId,
  selectedWebhookId,
  onSelectWebhook,
}: {
  endpointId: string;
  selectedWebhookId?: string;
  onSelectWebhook: (webhook: Webhook) => void;
}) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWebhooks();
  }, [endpointId, methodFilter, searchQuery]);

  useEffect(() => {
    // Set up SSE connection
    const eventSource = new EventSource(`/api/endpoints/${endpointId}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "webhook") {
        setWebhooks((prev) => [data.data, ...prev]);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [endpointId]);

  const fetchWebhooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (methodFilter !== "all") {
        params.set("method", methodFilter);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const res = await fetch(`/api/endpoints/${endpointId}/webhooks?${params}`);
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && webhooks.length === 0) {
    return (
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="text-sm text-muted-foreground">Loading webhooks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Webhooks</h3>
          <Badge variant="secondary" className="text-xs">
            {webhooks.length}
          </Badge>
        </div>
        <div>
          <Label htmlFor="method-filter" className="text-xs">Method</Label>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger id="method-filter" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="search" className="text-xs">Search</Label>
          <Input
            id="search"
            placeholder="Search in body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {webhooks.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No webhooks received yet. Send a request to your endpoint URL to see it here!
          </div>
        ) : (
          <div>
            {webhooks.map((webhook) => (
              <WebhookItem
                key={webhook.id}
                webhook={webhook}
                isSelected={selectedWebhookId === webhook.id}
                onClick={() => onSelectWebhook(webhook)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

