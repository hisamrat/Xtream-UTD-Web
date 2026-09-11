import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-main">
      <section className="no-results">
        <div className="no-results-inner">
          <h1 className="page-title text-accent">404</h1>
          <h2>This product could not be found.</h2>
          <p className="page-lede">It may have moved, sold out, or the link may be incorrect.</p>
          <div className="inline-action-row">
            <Link className="pill-button light" href="/">
              Go to Home
            </Link>
            <Link className="pill-button primary" href="/products">
              View Products
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
