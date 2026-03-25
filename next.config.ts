import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Required for ffmpeg.wasm (image tools - Phase B)
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
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

  // 301 redirects: 73 deleted duplicate tools → canonical tools
  // Preserves all SEO equity. Deploy BEFORE running the SQL cleanup.
  async redirects() {
    return [
      { source: "/tools/advanced-text-summarizer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/automatic-text-language-detector", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/base64-instagram-caption-encoder", destination: "/tools/base64-encoder", permanent: true },
      { source: "/tools/base64-text-visualizer", destination: "/tools/base64-encoder", permanent: true },
      { source: "/tools/call-to-action-text-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/case-conversion-with-custom-rules", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/compact-json-minifier", destination: "/tools/json-formatter", permanent: true },
      { source: "/tools/content-hash-generator", destination: "/tools/sha256-hash-generator", permanent: true },
      { source: "/tools/custom-regex-pattern-builder", destination: "/tools/regex-pattern-tester", permanent: true },
      { source: "/tools/hashtag-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/human-readable-password-generator", destination: "/tools/password-generator", permanent: true },
      { source: "/tools/ig-story-url-encoder", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/instagram-bio-slug-maker", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/instagram-caption-text-case", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/instagram-image-hex-to-rgb", destination: "/tools/hex-to-rgb-with-palette-generator", permanent: true },
      { source: "/tools/instagram-post-uuid-generator", destination: "/tools/uuid-version-selector", permanent: true },
      { source: "/tools/json-code-beautifier", destination: "/tools/json-formatter", permanent: true },
      { source: "/tools/json-seo-schema-formatter", destination: "/tools/json-formatter", permanent: true },
      { source: "/tools/keyword-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/lowercase-text-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/md5-sha256-dual-hasher", destination: "/tools/sha256-hash-generator", permanent: true },
      { source: "/tools/meta-description-creator", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/meta-description-length-checker", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/meta-description-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/random-pronounceable-password-generator", destination: "/tools/password-generator", permanent: true },
      { source: "/tools/random-seo-meta-tag-generator", destination: "/tools/custom-random-string-generator", permanent: true },
      { source: "/tools/secure-password-creator", destination: "/tools/password-generator", permanent: true },
      { source: "/tools/sentence-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/seo-keyword-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/seo-keyword-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/seo-keyword-density-checker", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/seo-keyword-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/seo-title-length-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/seo-title-optimizer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/slug-batch-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/smart-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/social-media-hashtag-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/story-highlight-password-checker", destination: "/tools/password-strength-checker", permanent: true },
      { source: "/tools/text-entropy-analyzer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/text-similarity-comparator", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/thumbnail-text-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/title-case-transformer", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/tweet-random-string-generator", destination: "/tools/custom-random-string-generator", permanent: true },
      { source: "/tools/tweet-timestamp-converter", destination: "/tools/unix-timestamp-converter", permanent: true },
      { source: "/tools/twitter-binary-to-text-converter", destination: "/tools/text-to-binary-visual-converter", permanent: true },
      { source: "/tools/twitter-bio-base64-decoder", destination: "/tools/base64-decoder", permanent: true },
      { source: "/tools/twitter-bio-base64-encoder", destination: "/tools/base64-encoder", permanent: true },
      { source: "/tools/twitter-bio-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/twitter-content-json-formatter", destination: "/tools/json-formatter", permanent: true },
      { source: "/tools/twitter-hashtag-analyzer", destination: "/tools/word-frequency-regex-extractor", permanent: true },
      { source: "/tools/twitter-profile-md5-hasher", destination: "/tools/md5-checksum-utility", permanent: true },
      { source: "/tools/twitter-sha256-hash-generator", destination: "/tools/sha256-hash-generator", permanent: true },
      { source: "/tools/twitter-text-to-binary-converter", destination: "/tools/text-to-binary-visual-converter", permanent: true },
      { source: "/tools/twitter-tweet-text-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/twitter-url-encoder", destination: "/tools/url-encoder-for-seo", permanent: true },
      { source: "/tools/twitter-username-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/twitter-uuid-generator-for-tweets", destination: "/tools/uuid-version-selector", permanent: true },
      { source: "/tools/unicode-character-inspector", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/uppercase-text-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/uuid-version-4-generator", destination: "/tools/uuid-version-selector", permanent: true },
      { source: "/tools/video-tag-text-transformer", destination: "/tools/advanced-text-transformer", permanent: true },
      { source: "/tools/video-title-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/youtube-comment-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/youtube-description-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/youtube-description-word-counter", destination: "/tools/word-counter", permanent: true },
      { source: "/tools/youtube-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/youtube-timestamp-converter", destination: "/tools/unix-timestamp-converter", permanent: true },
      { source: "/tools/youtube-title-case-converter", destination: "/tools/text-case-converter", permanent: true },
      { source: "/tools/youtube-video-id-extractor", destination: "/tools/word-frequency-regex-extractor", permanent: true },
      { source: "/tools/youtube-video-md5-hasher", destination: "/tools/md5-checksum-utility", permanent: true },
      { source: "/tools/youtube-video-slug-generator", destination: "/tools/seo-slug-generator", permanent: true },
      { source: "/tools/youtube-video-url-decoder", destination: "/tools/seo-url-decoder", permanent: true },
      { source: "/tools/youtube-video-url-encoder", destination: "/tools/url-encoder-for-seo", permanent: true },
    ];
  },
};

export default nextConfig;