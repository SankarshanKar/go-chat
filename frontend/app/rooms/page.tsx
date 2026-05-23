"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { RoomCard } from "@/components/room-card";
import { getRooms, createRoom, type Room } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, RefreshCw } from "lucide-react";

export default function RoomsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState("");

  // Create room states
  const [newRoomId, setNewRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchRoomsList = useCallback(async (showSilently = false) => {
    if (!showSilently) setLoadingRooms(true);
    setError("");
    try {
      const data = await getRooms();
      // Ensure data is array
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load rooms. Please make sure the backend is running.");
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else {
        timeout = setTimeout(() => {
          fetchRoomsList();
        }, 0);
      }
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [user, authLoading, router, fetchRoomsList]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomId.trim() || !newRoomName.trim()) return;

    setCreating(true);
    setCreateError("");

    try {
      await createRoom({
        id: newRoomId.trim(),
        name: newRoomName.trim(),
      });
      setNewRoomId("");
      setNewRoomName("");
      await fetchRoomsList(true);
    } catch (err) {
      setCreateError("Failed to create room. The ID might already be taken.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/chat?roomId=${roomId}`);
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-6xl px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Create Room Panel */}
        <div className="md:col-span-1">
          <Card className="border-border/50 bg-card/40 sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Create a New Room</CardTitle>
              <CardDescription>
                Start a new conversation channel instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomId">Room ID (Unique)</Label>
                  <Input
                    id="roomId"
                    placeholder="e.g. general, tech-talk"
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomName">Room Display Name</Label>
                  <Input
                    id="roomName"
                    placeholder="e.g. General Discussion"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>

                {createError && (
                  <p className="text-sm text-destructive font-medium">
                    {createError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create Room
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Rooms Listing */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Available Rooms
              </h2>
              <p className="text-sm text-muted-foreground">
                Join a room and start messaging.
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchRoomsList(false)}
              disabled={loadingRooms}
              className="border-border/50 bg-card/40"
            >
              <RefreshCw
                className={`h-4 w-4 text-muted-foreground ${
                  loadingRooms ? "animate-spin" : ""
                }`}
              />
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive flex flex-col gap-2">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit border-destructive/30 hover:bg-destructive/10 text-destructive"
                onClick={() => fetchRoomsList(false)}
              >
                Retry
              </Button>
            </div>
          )}

          {!loadingRooms && rooms.length === 0 && !error && (
            <div className="rounded-xl border border-dashed border-border/80 p-12 text-center space-y-3 bg-card/10">
              <p className="text-muted-foreground text-sm">
                No chat rooms created yet.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Use the panel on the left to create the very first discussion
                room.
              </p>
            </div>
          )}

          {loadingRooms ? (
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 rounded-xl border border-border/30 bg-card/20 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onJoin={handleJoinRoom}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
