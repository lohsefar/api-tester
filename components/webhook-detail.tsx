"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { JsonViewerComponent } from "./json-viewer";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Webhook {
  id: string;
  method: string;
  receivedAt: Date | string;
  ip?: string | null;
  body?: string | null;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
}

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  POST: "bg-green-500/20 text-green-400 border-green-500/30",
  PUT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function WebhookDetail({ webhook }: { webhook: Webhook | null }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (!webhook) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No webhook selected</p>
          <p className="text-sm">Select a webhook from the list to view details</p>
        </div>
      </div>
    );
  }

  const methodColor = methodColors[webhook.method] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const receivedAt = typeof webhook.receivedAt === "string" 
    ? new Date(webhook.receivedAt) 
    : webhook.receivedAt;
  const bodySize = webhook.body ? `${(webhook.body.length / 1024).toFixed(1)} kB` : "0 kB";

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  let parsedBody: any = null;
  let isJson = false;
  if (webhook.body) {
    try {
      parsedBody = JSON.parse(webhook.body);
      isJson = true;
    } catch {
      parsedBody = webhook.body;
    }
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Badge className={methodColor}>{webhook.method}</Badge>
                <span className="text-sm font-mono text-muted-foreground">
                  #{webhook.id.slice(0, 8)}
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground mb-1">Received At</div>
                <div>{format(receivedAt, "PPpp")}</div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Size</div>
                <div>{bodySize}</div>
              </div>
              {webhook.ip && (
                <div>
                  <div className="text-muted-foreground mb-1">IP Address</div>
                  <div className="font-mono">{webhook.ip}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {webhook.queryParams && Object.keys(webhook.queryParams).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Query Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(webhook.queryParams).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="font-mono text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Headers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {webhook.headers && Object.entries(webhook.headers).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between py-2 border-b border-border last:border-0 group">
                  <span className="font-mono text-sm text-muted-foreground">{key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm max-w-md truncate">{value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => copyToClipboard(value, `header-${key}`)}
                    >
                      {copied === `header-${key}` ? "✓" : "📋"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {webhook.body && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Body</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(webhook.body!, "body")}
                >
                  {copied === "body" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isJson ? (
                <div className="rounded-md border border-border p-4 bg-muted/50">
                  <JsonViewerComponent data={parsedBody} />
                </div>
              ) : (
                <pre className="rounded-md border border-border p-4 bg-muted/50 overflow-auto">
                  <code className="text-sm font-mono">{webhook.body}</code>
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

