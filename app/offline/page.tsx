import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline",
  description: "Xtream UTD offline state."
};

export default function OfflinePage() {
  return (
    <main className="page-main">
      <section className="no-results">
        <div className="no-results-inner">
          <div className="no-results-icon" aria-hidden="true">
            <span className="offline-symbol">///</span>
          </div>
          <h1>You are currently offline.</h1>
          <p className="page-lede">
            Saved navigation remains available. Product images may not load.
          </p>
          <button className="button primary" type="button">
            Retry Connection
          </button>
        </div>
      </section>
    </main>
  );
}
