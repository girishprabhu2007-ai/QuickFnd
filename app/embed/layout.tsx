/**
 * app/embed/layout.tsx
 * Overrides the root layout for all /embed/* routes.
 * Renders a bare HTML shell — no site header, footer, theme, or fonts.
 */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}