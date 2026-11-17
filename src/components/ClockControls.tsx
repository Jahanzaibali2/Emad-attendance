"use client";

import { useState, useTransition } from "react";
import {
  clockInAction,
  clockOutAction,
  pauseAction,
} from "@/app/actions/clock";
import type { LiveState } from "@/lib/domain/attendance";

const primary =
  "clock-btn w-full bg-gold px-6 py-4 font-display text-xl text-ink transition hover:bg-gold-deep hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-60";
const secondary =
  "clock-btn w-full border border-gold-deep bg-transparent px-6 py-3.5 font-display text-lg text-gold-deep transition hover:bg-gold-deep hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-60";

export function ClockControls({ live }: { live: LiveState }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    start(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      {live === "not_working" ? (
        <button
          type="button"
          disabled={pending}
          className={primary}
          onClick={() => run(clockInAction)}
        >
          {pending ? "Starting…" : "Clock in"}
        </button>
      ) : null}

      {live === "working" ? (
        <>
          <button
            type="button"
            disabled={pending}
            className={primary}
            onClick={() => run(pauseAction)}
          >
            {pending ? "Pausing…" : "Pause"}
          </button>
          <button
            type="button"
            disabled={pending}
            className={secondary}
            onClick={() => run(clockOutAction)}
          >
            Clock out
          </button>
        </>
      ) : null}

      {live === "on_break" ? (
        <>
          <button
            type="button"
            disabled={pending}
            className={primary}
            onClick={() => run(clockInAction)}
          >
            {pending ? "Resuming…" : "Resume"}
          </button>
          <button
            type="button"
            disabled={pending}
            className={secondary}
            onClick={() => run(clockOutAction)}
          >
            Clock out
          </button>
          <p className="text-center text-xs text-slate">
            Break time is not counted. Resume when you are back.
          </p>
        </>
      ) : null}

      {error ? <p className="text-center text-sm text-absent">{error}</p> : null}
    </div>
  );
}
