"use client";

import { useRef, useState, useTransition } from "react";
import {
  removeSummaryImageAction,
  saveDailySummaryAction,
} from "@/app/actions/daily-summary";

type Props = {
  initialBody: string;
  images: { id: string; url: string }[];
};

export function DailySummaryEditor({ initialBody, images }: Props) {
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onSave(formData: FormData) {
    setError(null);
    setMessage(null);
    formData.set("body", body);
    start(async () => {
      const result = await saveDailySummaryAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Saved");
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function onRemove(imageId: string) {
    setError(null);
    start(async () => {
      const result = await removeSummaryImageAction(imageId);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <form action={onSave} className="space-y-4">
      <label className="block text-sm text-slate">
        What did you do today?
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-2 w-full border border-line bg-parchment px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          placeholder="Short note of today’s work…"
        />
      </label>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt="Work summary"
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                disabled={pending}
                className="absolute right-1 top-1 bg-ink/80 px-2 py-0.5 text-xs text-parchment hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <label className="block text-sm text-slate">
        Add photos
        <input
          ref={fileRef}
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="mt-2 block w-full text-sm text-slate file:mr-3 file:border-0 file:bg-line file:px-3 file:py-2 file:text-ink"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-gold px-5 py-2.5 font-display text-ink hover:bg-gold-deep hover:text-parchment focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save summary"}
      </button>

      {error ? <p className="text-sm text-absent">{error}</p> : null}
      {message ? <p className="text-sm text-gold-deep">{message}</p> : null}
    </form>
  );
}
