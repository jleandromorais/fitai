"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface SessionHistory {
  workoutId: number;
  workoutName: string;
  workoutCode: string;
  executedAt: string;
  durationMinutes: number;
  setsCompleted: number;
  totalVolume: number;
}

export function useSessions(days = 30) {
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<SessionHistory[]>(`/workouts/sessions/recent?days=${days}`)
      .then(setSessions)
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [days]);

  return { sessions, loading };
}
