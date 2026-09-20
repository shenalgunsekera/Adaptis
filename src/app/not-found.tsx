import Link from "next/link";

export default function NotFound() {
  return (
    <main className="on-ink" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div className="wrap" style={{ textAlign: "center", paddingBlock: "var(--sec-y)" }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>
          Page not found
        </p>
        <h1 className="h1-page" style={{ marginTop: "var(--space-4)" }}>
          That page is not here.
        </h1>
        <p className="lede" style={{ margin: "var(--space-5) auto 0" }}>
          The address may have changed, or it may never have existed. Start from what we do, or tell
          us the decision you are facing.
        </p>
        <div
          className="row"
          style={{ justifyContent: "center", marginTop: "var(--space-6)" }}
        >
          <Link href="/what-we-do" className="btn btn--primary">
            What we do
          </Link>
          <Link href="/" className="btn btn--ghost">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
