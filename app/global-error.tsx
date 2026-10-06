"use client";

import "./globals.css";

/** Last-resort boundary when the root layout itself fails (no providers available here). */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <main className="page-main">
          <section className="no-results">
            <div className="no-results-inner">
              <h1>Something went wrong.</h1>
              <p className="page-lede">Please try again. If the problem continues, contact us on Messenger.</p>
              <div className="inline-action-row">
                <button className="button primary" type="button" onClick={() => retry()}>
                  Try Again
                </button>
              </div>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
