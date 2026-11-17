import { autoCloseStaleSessions } from "@/lib/services/sessions";

let started = false;

/** ponytail: in-process minute poll; split to worker if multi-instance */
export function startAutoCloseScheduler() {
  if (started || process.env.NEXT_RUNTIME === "edge") return;
  started = true;

  const tick = async () => {
    try {
      const n = await autoCloseStaleSessions();
      if (n > 0) console.info(`[auto-close] closed ${n} session(s)`);
    } catch (err) {
      console.error("[auto-close]", err);
    }
  };

  void tick();
  setInterval(tick, 60_000);
}
