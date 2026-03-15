import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/theme/ThemeProvider";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "QuickFnd",
  description: "Discover useful tools, calculators, and AI utilities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeInitScript = `
    (function() {
      try {
        var stored = localStorage.getItem("quickfnd-theme");
        var prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        var theme = stored === "light" || stored === "dark"
          ? stored
          : (prefersLight ? "light" : "dark");

        document.documentElement.setAttribute("data-theme", theme);
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-q-bg text-q-text transition-colors">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <ThemeProvider>
          <div className="min-h-screen bg-q-bg text-q-text">
            <SiteHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}