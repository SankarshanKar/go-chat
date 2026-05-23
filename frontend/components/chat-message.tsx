"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "@/lib/api";

interface ChatMessageProps {
  message: ChatMessageType;
  currentUsername: string;
}

const SYSTEM_MESSAGES = [
  "A new user has joined the room",
  "User left the chat",
];

export function ChatMessage({ message, currentUsername }: ChatMessageProps) {
  const isSystem = SYSTEM_MESSAGES.some((m) =>
    message.content.includes(m)
  );
  const isOwn = message.username === currentUsername;

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full bg-secondary/60 px-4 py-1.5 text-xs text-muted-foreground">
          {message.username && (
            <span className="font-medium">{message.username}</span>
          )}{" "}
          — {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {!isOwn && (
          <span className="ml-1 text-xs font-medium text-muted-foreground">
            {message.username}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md bg-secondary text-secondary-foreground"
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
