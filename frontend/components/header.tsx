"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, MessageSquare } from "lucide-react";

interface HeaderProps {
  showLogout?: boolean;
}

export function Header({ showLogout = true }: HeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">GoChat</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-medium uppercase">
                {user.username.charAt(0)}
              </div>
              <span className="text-sm text-muted-foreground">
                {user.username}
              </span>
            </div>
            {showLogout && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
