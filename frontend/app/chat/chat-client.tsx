"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { ChatMessage } from "@/components/chat-message";
import { getClients, WS_URL, type ChatMessage as ChatMessageType, type Client } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Users, Circle, Loader2 } from "lucide-react";

export default function ChatClient() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [inputText, setInputText] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch clients inside the room
  const fetchClientsList = async () => {
    if (!roomId) return;
    try {
      const list = await getClients(roomId);
      setClients(Array.isArray(list) ? list : []);
    } catch {
      // Fail silently for polling
    }
  };

  // Poll clients list every 5 seconds
  useEffect(() => {
    if (!roomId || !isConnected) return;
    fetchClientsList();
    const interval = setInterval(fetchClientsList, 5000);
    return () => clearInterval(interval);
  }, [roomId, isConnected]);

  // Connect to WebSocket
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roomId) {
      router.replace("/rooms");
      return;
    }

    const socketUrl = `${WS_URL}/ws/joinRoom/${roomId}?userId=${user.id}&username=${user.username}`;
    const ws = new WebSocket(socketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setError("");
      fetchClientsList();
    };

    ws.onmessage = (event) => {
      try {
        const msg: ChatMessageType = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        // Fallback for non-JSON messages just in case
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setError("WebSocket connection failed. Please verify the backend is running.");
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [user, authLoading, roomId, router]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !wsRef.current || !isConnected) return;

    // Send as plain string text as required by Go backend
    wsRef.current.send(inputText.trim());
    setInputText("");
  };

  if (authLoading || !user || !roomId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header showLogout={false} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col border border-border/50 rounded-2xl bg-card/10 overflow-hidden h-full">
          {/* Room Info Header */}
          <div className="p-4 border-b border-border/50 bg-card/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/rooms")}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="font-semibold tracking-tight text-sm md:text-base">
                  Room: {roomId}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Circle
                    className={`h-2.5 w-2.5 fill-current ${
                      isConnected ? "text-green" : "text-destructive"
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 bg-background/30">
            {error && (
              <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-xs text-destructive text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage
                  key={index}
                  message={msg}
                  currentUsername={user.username}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-border/50 bg-card/30 flex gap-2"
          >
            <Input
              placeholder={
                isConnected ? "Type a message..." : "Connecting to chat..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!isConnected}
              className="flex-1 bg-background/50"
              autoComplete="off"
            />
            <Button type="submit" disabled={!isConnected || !inputText.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Sidebar: Online Clients */}
        <div className="w-full md:w-64 border border-border/50 rounded-2xl bg-card/10 overflow-hidden flex flex-col h-[200px] md:h-full">
          <div className="p-4 border-b border-border/50 bg-card/30 flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Active Members ({clients.length})</h3>
          </div>
          <ScrollArea className="flex-1 p-4 bg-background/30">
            <div className="space-y-3">
              {clients.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
                    {c.username.charAt(0)}
                  </div>
                  <span className="text-sm truncate font-medium text-muted-foreground">
                    {c.username}
                  </span>
                  {c.id === user.id && (
                    <span className="text-[10px] bg-secondary/80 text-muted-foreground px-1.5 py-0.5 rounded-full ml-auto">
                      You
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
