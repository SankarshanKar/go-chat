"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users } from "lucide-react";
import type { Room } from "@/lib/api";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  return (
    <Card className="group transition-all duration-200 hover:border-foreground/20 hover:bg-card/80">
      <CardContent className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-foreground/10">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium tracking-tight">{room.name}</h3>
            <p className="text-xs text-muted-foreground">Room #{room.id}</p>
          </div>
        </div>
        <Button
          onClick={() => onJoin(room.id)}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          Join
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </CardContent>
    </Card>
  );
}
