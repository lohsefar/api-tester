"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WebhookList } from "@/components/webhook-list";
import { WebhookDetail } from "@/components/webhook-detail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Endpoint {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
}

interface Webhook {
  id: string;
  method: string;
  receivedAt: Date | string;
  ip?: string | null;
  body?: string | null;
  headers?: Record<string, string> | null;
  queryParams?: Record<string, string> | null;
}

export default function EndpointPage() {
  const params = useParams();
  const endpointId = params.id as string;
  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchEndpoint();
  }, [endpointId]);

  const fetchEndpoint = async () => {
    try {
      const res = await fetch(`/api/endpoints/${endpointId}`);
      if (res.ok) {
        const data = await res.json();
        setEndpoint(data);
        setWebhookUrl(`${window.location.origin}/api/webhook/${data.slug}`);
      }
    } catch (error) {
      console.error("Failed to fetch endpoint:", error);
    }
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!endpoint) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <WebhookList
        endpointId={endpointId}
        selectedWebhookId={selectedWebhook?.id}
        onSelectWebhook={setSelectedWebhook}
      />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold mb-2">{endpoint.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono break-all">
                  {webhookUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyUrl}
                  className="h-7 shrink-0"
                >
                  {copied ? "✓ Copied!" : "Copy URL"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <WebhookDetail webhook={selectedWebhook} />
      </div>
    </div>
  );
}

