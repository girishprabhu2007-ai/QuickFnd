import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Increase worker memory for large builds (145+ dynamic pages)
  experimental: {
    workerThreads: false,
    cpus: 2,
  },

  async headers() {
    return [
      {
        // All pages EXCEPT embed — keep existing security headers
        source: "/((?!embed).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
      {
        // Embed pages — ALLOW iframing (the whole point of embeds)
        source: "/embed/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // No X-Frame-Options here — embeds MUST be iframeable
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // ═══════════════════════════════════════════════════════════════════
      // DUPLICATE TOOL SLUG REDIRECTS — SEO deduplication
      // Shorter canonical slug wins. Longer variant 301s to it.
      // Prevents keyword cannibalization between near-identical pages.
      // ═══════════════════════════════════════════════════════════════════

      // Image/PDF converter duplicates (short slug is canonical)
      { source: "/tools/text-to-pdf-converter", destination: "/tools/text-to-pdf", permanent: true },
      { source: "/tools/image-to-pdf-converter", destination: "/tools/image-to-pdf", permanent: true },
      { source: "/tools/svg-to-png-converter", destination: "/tools/svg-to-png", permanent: true },
      { source: "/tools/image-to-base64-converter", destination: "/tools/image-to-base64", permanent: true },
      { source: "/tools/png-to-pdf-converter", destination: "/tools/image-to-pdf", permanent: true },
      { source: "/tools/jpg-to-pdf-converter", destination: "/tools/image-to-pdf", permanent: true },
      { source: "/tools/split-pdf-online", destination: "/tools/pdf-splitter", permanent: true },
      { source: "/tools/merge-pdf-online", destination: "/tools/pdf-merger", permanent: true },

      // ═══════════════════════════════════════════════════════════════════
      // LEGACY REDIRECTS — carried forward from earlier sessions
      // ═══════════════════════════════════════════════════════════════════
      { source: "/tools/binary-to-text-calculator", destination: "/tools/binary-to-text-converter", permanent: true },
      { source: "/tools/blog-post-slug-builder", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/case-style-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/content-keyword-analyzer", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/content-length-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/cryptocurrency-price-hash-generator", destination: "/tools/sha256-hash-generator", permanent: true },
      { source: "/tools/currency-arbitrage-calculator", destination: "/tools/advanced-numerical-sequence-generator", permanent: true },
      { source: "/tools/currency-exchange-rate-calculator", destination: "/tools/currency-converter", permanent: true },
      { source: "/tools/headline-enhancer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/hex-to-rgb-color-converter", destination: "/tools/hex-to-rgb-with-palette-generator", permanent: true },
      { source: "/tools/hex-to-rgb-converter", destination: "/tools/hex-to-rgb-with-palette-generator", permanent: true },
      { source: "/tools/hexadecimal-string-generator", destination: "/tools/custom-random-string-generator", permanent: true },
      { source: "/tools/keyword-case-formatter", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/keyword-density-analyzer", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/meta-description-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/meta-description-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/passive-voice-detector", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/random-string-generator-with-custom-rules", destination: "/tools/custom-random-string-generator", permanent: true },
      { source: "/tools/regular-expression-tester", destination: "/tools/regex-pattern-tester", permanent: true },
      { source: "/tools/sentence-capitalizer", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/seo-keyword-density-analyzer", destination: "/tools/word-frequency-regex-extractor", permanent: true },
      { source: "/tools/seo-text-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/seo-url-encoder", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/text-case-conversion-suite", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/text-simplifier", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/text-to-binary-converter", destination: "/tools/text-to-binary-visual-converter", permanent: true },
      { source: "/tools/thumbnail-caption-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/timestamp-to-date-converter", destination: "/tools/unix-timestamp-converter", permanent: true },
      { source: "/tools/title-case-formatter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/tweet-character-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/tweet-json-formatter", destination: "/tools/json-formatter", permanent: true },
      { source: "/tools/tweet-url-encoder", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/twitter-bio-password-strength", destination: "/tools/password-strength-checker", permanent: true },
      { source: "/tools/twitter-hashtag-formatter", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/twitter-md5-hash-generator", destination: "/tools/md5-checksum-utility", permanent: true },
      { source: "/tools/twitter-username-slugifier", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/url-encoder-for-campaign-links", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/url-encoding-decoding-tool", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/video-description-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/video-transcript-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/word-count-assistant", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/youtube-comment-text-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
    ];
  },
};

export default nextConfig;
