"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    start(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit}>
      <label className="flex flex-col gap-2 text-sm text-slate">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="border border-line bg-transparent px-3 py-3 text-base text-ink transition focus-visible:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm text-slate">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="border border-line bg-transparent px-3 py-3 text-base text-ink transition focus-visible:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
      </label>
      {error ? (
        <p className="text-sm text-absent" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 bg-gold px-4 py-3.5 font-display text-xl text-ink transition hover:bg-gold-deep hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
