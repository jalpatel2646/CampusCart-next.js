"use client";

import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Last-resort boundary shown when the root layout itself fails, so it must
 * render its own <html> and <body> and cannot use shared UI components.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f0",
          color: "#252923",
          fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#fbeeee",
            }}
          >
            <AlertTriangle size={32} color="#d95757" aria-hidden="true" />
          </div>

          <h1 style={{ marginTop: 24, fontSize: 28, letterSpacing: "-0.02em" }}>
            CampusCart could not start
          </h1>
          <p style={{ marginTop: 12, color: "#777d75", lineHeight: 1.6 }}>
            A critical error stopped the app from loading. Reload the page. If it
            continues, report it through the project issue tracker.
          </p>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                border: 0,
                borderRadius: 8,
                padding: "11px 18px",
                background: "#173d32",
                color: "#d9f36a",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reload the app
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 8,
                padding: "10px 18px",
                border: "1px solid #e8e9e2",
                color: "#252923",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
