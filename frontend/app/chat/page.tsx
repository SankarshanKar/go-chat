import { Suspense } from "react";
import ChatClient from "./chat-client";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ChatClient />
    </Suspense>
  );
}
