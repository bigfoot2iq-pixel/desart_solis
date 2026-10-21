"use client";

/**
 * The last line of defence.
 *
 * When the root layout itself fails, Next.js swaps the whole document for this
 * one — it has to render its own `<html>` and `<body>`, because nothing above
 * it can be trusted. It is intentionally dependency-free: no fonts, no styles
 * beyond the inline sheet, nothing that could fail a second time.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "3rem 1.5rem",
          textAlign: "center",
          background: "#f3f0ec",
          color: "#1c2420",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.7rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#806224" }}>
          Un souci est survenu
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 6vw, 2.6rem)", fontWeight: 300, lineHeight: 1.15 }}>
          La page n’a pas pu se charger.
        </h1>
        <p style={{ margin: 0, maxWidth: "28rem", fontSize: "0.95rem", lineHeight: 1.7, color: "#5c6660" }}>
          C’est temporaire. Rechargez la page — si le problème persiste, écrivez-nous sur WhatsApp, on s’en occupe.
        </p>
        {/* A plain anchor, not next/link: the root layout is what failed, so a
            client-side navigation could fail too. A full page load is the one
            route that is guaranteed to work from here. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the router cannot be trusted here */}
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: "0.75rem",
            padding: "0.9rem 2rem",
            borderRadius: "9999px",
            background: "#233129",
            color: "#f3f0ec",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          Retour à l’accueil
        </a>
        {error.digest && (
          <p style={{ margin: 0, fontSize: "0.65rem", color: "#9aa39d" }}>Référence : {error.digest}</p>
        )}
      </body>
    </html>
  );
}
