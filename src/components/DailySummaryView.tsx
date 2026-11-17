type Props = {
  body: string;
  images: { id: string; url: string }[];
  emptyLabel?: string;
};

export function DailySummaryView({
  body,
  images,
  emptyLabel = "No summary yet",
}: Props) {
  if (!body && images.length === 0) {
    return <p className="text-sm text-slate">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-4">
      {body ? (
        <p className="whitespace-pre-wrap text-ink">{body}</p>
      ) : (
        <p className="text-sm text-slate">No text — photos only</p>
      )}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={img.url}
              alt="Work summary"
              className="h-28 w-full object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
