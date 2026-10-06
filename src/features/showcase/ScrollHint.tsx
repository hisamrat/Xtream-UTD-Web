/** Mouse icon + label + chevron used by the "scroll to explore" prompts. */
export function ScrollHint({ label }: { label: string }) {
  return (
    <>
      <span className="scroll-mouse-wrap" aria-hidden="true">
        <svg className="scroll-mouse-svg" width="12" height="17" viewBox="0 0 14 20" fill="none">
          <rect x="1" y="1" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="1.6" />
          <line className="scroll-wheel-line" x1="7" y1="5" x2="7" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="scroll-label-text">{label}</span>
      <span className="scroll-chevron-wrap" aria-hidden="true">
        <svg className="scroll-chevron-svg" width="9" height="5" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </>
  );
}
