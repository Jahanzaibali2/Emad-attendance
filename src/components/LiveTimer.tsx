"use client";

import { useEffect, useState } from "react";
import { formatDurationHms } from "@/lib/domain/attendance";

type Props = {
  closedSeconds: number;
  openStartedAt: string | null;
  running: boolean;
};

export function LiveTimer({ closedSeconds, openStartedAt, running }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running || !openStartedAt) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [running, openStartedAt]);

  const openElapsed =
    running && openStartedAt
      ? Math.max(0, Math.floor((now - new Date(openStartedAt).getTime()) / 1000))
      : 0;
  const total = closedSeconds + openElapsed;

  return (
    <p
      className="font-display text-[clamp(3.5rem,12vw,5.5rem)] leading-none tracking-tight text-gold-deep tabular-nums"
      aria-live="polite"
      aria-atomic="true"
    >
      {formatDurationHms(total)}
    </p>
  );
}
