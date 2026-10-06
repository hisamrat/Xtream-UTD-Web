/** A run of text where some segments are emphasised (rendered as <strong>). */
export type RichSegment = string | { strong: string };

export function RichText({ segments }: { segments: readonly RichSegment[] }) {
  return (
    <>
      {segments.map((segment, index) =>
        typeof segment === "string" ? segment : <strong key={index}>{segment.strong}</strong>
      )}
    </>
  );
}
