"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Endpoint {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export function EndpointSidebar() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [endpointToDelete, setEndpointToDelete] = useState<string | null>(null);
  const [newEndpointName, setNewEndpointName] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract endpoint ID from pathname
  const selectedEndpointId = pathname?.startsWith("/endpoints/") 
    ? pathname.split("/endpoints/")[1]?.split("/")[0]
    : undefined;

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const fetchEndpoints = async () => {
    try {
      const res = await fetch("/api/endpoints");
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data);
      }
    } catch (error) {
      console.error("Failed to fetch endpoints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEndpointToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!endpointToDelete) return;

    try {
      const res = await fetch(`/api/endpoints/${endpointToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setEndpoints(endpoints.filter((e) => e.id !== endpointToDelete));
        if (selectedEndpointId === endpointToDelete) {
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Failed to delete endpoint:", error);
    } finally {
      setDeleteDialogOpen(false);
      setEndpointToDelete(null);
    }
  };

  const handleCreateClick = () => {
    setNewEndpointName("");
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = async () => {
    if (!newEndpointName.trim()) return;

    try {
      const res = await fetch("/api/endpoints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newEndpointName.trim() }),
      });
      if (res.ok) {
        const newEndpoint = await res.json();
        setEndpoints([...endpoints, newEndpoint]);
        setCreateDialogOpen(false);
        setNewEndpointName("");
        router.push(`/endpoints/${newEndpoint.id}`);
      }
    } catch (error) {
      console.error("Failed to create endpoint:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-64 border-r border-border bg-sidebar p-4">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-64 border-r border-border bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border">
          <Button onClick={handleCreateClick} className="w-full" size="sm">
            + New Endpoint
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {endpoints.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No endpoints yet. Create one to get started!
              </div>
            ) : (
              endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  onClick={() => router.push(`/endpoints/${endpoint.id}`)}
                  className={cn(
                    "group flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors",
                    selectedEndpointId === endpoint.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {endpoint.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {endpoint.slug}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                      >
                        ⋮
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => handleDeleteClick(endpoint.id, e)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Endpoint</DialogTitle>
            <DialogDescription>
              Enter a name for your webhook endpoint
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="endpoint-name">Endpoint Name</Label>
            <Input
              id="endpoint-name"
              value={newEndpointName}
              onChange={(e) => setNewEndpointName(e.target.value)}
              placeholder="My Webhook Endpoint"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newEndpointName.trim()) {
                  handleCreateConfirm();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateConfirm} disabled={!newEndpointName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Endpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this endpoint? This action cannot be undone and all webhooks associated with this endpoint will be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
