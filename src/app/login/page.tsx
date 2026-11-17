import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "OWNER" ? "/monitor" : "/today");
  }

  return (
    <main className="login-shell relative flex min-h-full flex-1 flex-col lg:flex-row">
      <div className="login-hero relative h-44 w-full overflow-hidden sm:h-56 lg:h-auto lg:min-h-full lg:w-[52%]">
        <Image
          src="/images/login-hero.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 52vw"
          className="object-cover object-[center_35%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/45 via-ink/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-ink/5 lg:to-ink/35"
        />
        <div
          aria-hidden
          className="absolute inset-y-0 right-0 hidden w-px bg-gold/40 lg:block"
        />
      </div>

      <section className="relative flex w-full flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:w-[48%] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-md animate-rise">
          <p className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[1.05] tracking-tight text-ink">
            Emad&apos;s
            <span className="block text-gold-deep">Attendance</span>
          </p>
          <p className="mt-4 max-w-sm text-base text-slate">
            Sign in to clock work hours and review the day.
          </p>
          <p className="mt-2 text-xs text-slate/80">
            All times are Pakistan Standard Time.
          </p>

          <div className="mt-8 h-px w-16 bg-gold" aria-hidden />

          <LoginForm />
        </div>
      </section>
    </main>
  );
}
