export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startAutoCloseScheduler } = await import("@/lib/auto-close");
    startAutoCloseScheduler();
  }
}
