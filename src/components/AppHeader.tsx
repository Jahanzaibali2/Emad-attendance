import { signOut } from "@/auth";

export function AppHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
      <div>
        <p className="font-display text-2xl tracking-tight text-ink md:text-3xl">
          {title}
        </p>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate">{subtitle}</p>
        ) : null}
      </div>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="text-sm text-slate underline-offset-4 hover:text-gold-deep hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Sign out
        </button>
      </form>
    </header>
  );
}
