// hooks/use-stickers.ts
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const STICKERS = ["🔥", "⚡", "😂", "🎯", "💯", "👑", "🚀", "❤️", "😱", "🎉"];

export function useStickers(roomId: string) {
  const [incoming, setIncoming] = useState<{ emoji: string; id: string }[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`stickers:${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "sticker_events",
        filter: `room_id=eq.${roomId}`,
      }, (payload) => {
        const ev = { emoji: payload.new.emoji, id: payload.new.id };
        setIncoming((prev) => [...prev.slice(-20), ev]);
        setTimeout(() => setIncoming((prev) => prev.filter((s) => s.id !== ev.id)), 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const sendSticker = async (emoji: string, playerId: string) => {
    await supabase.from("sticker_events").insert({ room_id: roomId, player_id: playerId, emoji });
  };

  return { incoming, sendSticker };
}