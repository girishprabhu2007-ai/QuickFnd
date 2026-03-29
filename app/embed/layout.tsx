/**
 * app/embed/layout.tsx
 * Minimal layout for embed routes — strips all site chrome (header, footer, theme).
 * Embed pages render inside iframes on third-party sites.
 */

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#f8fafc" }}>
        {children}
      </body>
    </html>
  );
}
