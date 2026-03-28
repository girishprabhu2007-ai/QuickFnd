"use client";

import { useState, useRef, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   FILE TOOL RENDERER
   Handles: image-compressor, image-resizer, image-converter, heic-converter,
            image-cropper, image-to-base64, svg-to-png,
            pdf-to-image, image-to-pdf
   All processing is 100% client-side — files never leave the browser.
   ═══════════════════════════════════════════════════════════════════════════════ */

type FileToolFamily =
  | "image-compressor"
  | "image-resizer"
  | "image-converter"
  | "image-cropper"
  | "image-to-base64"
  | "svg-to-png";

type Props = {
  family: FileToolFamily;
  title: string;
};

/* ─── Design tokens ──────────────────────────────────────────────────────────── */

const cls = {
  card: "rounded-[28px] border border-q-border bg-q-card p-6 shadow-sm md:p-8",
  dropzone: "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-q-border/60 bg-q-bg/50 p-10 transition-colors cursor-pointer hover:border-blue-400/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10",
  dropzoneActive: "border-blue-400 bg-blue-50/50 dark:bg-blue-900/20",
  label: "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-q-muted",
  input: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/10",
  panel: "rounded-2xl border border-q-border bg-q-bg p-5",
  primaryBtn: "rounded-xl bg-q-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-q-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn: "rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50",
  badge: (color: string) => `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`,
  accentBar: (color: string) => `h-1 w-12 rounded-full ${color}`,
  sectionTitle: "text-xs font-semibold uppercase tracking-[0.16em] text-q-muted",
  previewImg: "max-h-[300px] max-w-full rounded-xl border border-q-border object-contain",
  stat: "rounded-xl border border-q-border bg-q-card px-4 py-3 text-center",
  statLabel: "text-xs text-q-muted",
  statValue: "mt-1 text-lg font-bold text-q-text",
};

/* ─── Tool identity ──────────────────────────────────────────────────────────── */

type ToolIdentity = {
  icon: string;
  barColor: string;
  badgeColor: string;
  description: string;
  accepts: string;
  acceptLabel: string;
  tips: string[];
};

function getIdentity(family: FileToolFamily): ToolIdentity {
  switch (family) {
    case "image-compressor":
      return {
        icon: "📦", barColor: "bg-emerald-500",
        badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
        description: "Reduce image file size without visible quality loss. Perfect for web optimization.",
        accepts: "image/jpeg,image/png,image/webp", acceptLabel: "JPG, PNG, or WebP",
        tips: ["80% quality is the sweet spot — saves 60-70% file size with minimal visual difference", "WebP output gives the best compression for web use", "Drag multiple images for batch processing"],
      };
    case "image-resizer":
      return {
        icon: "📐", barColor: "bg-blue-500",
        badgeColor: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        description: "Resize images to exact dimensions. Maintain aspect ratio or set custom width and height.",
        accepts: "image/jpeg,image/png,image/webp,image/gif", acceptLabel: "JPG, PNG, WebP, or GIF",
        tips: ["Lock aspect ratio to prevent distortion", "Social media sizes: Instagram 1080×1080, Twitter 1200×675, LinkedIn 1200×627", "For retina displays, export at 2x the display size"],
      };
    case "image-converter":
      return {
        icon: "🔄", barColor: "bg-violet-500",
        badgeColor: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        description: "Convert between image formats instantly. JPG, PNG, WebP — all in your browser.",
        accepts: "image/jpeg,image/png,image/webp,image/bmp,image/gif", acceptLabel: "JPG, PNG, WebP, BMP, or GIF",
        tips: ["PNG for transparency, JPG for photos, WebP for web (smallest size)", "Converting PNG → JPG removes transparency (white background)", "WebP saves 25-35% vs JPG at same quality"],
      };
    case "image-cropper":
      return {
        icon: "✂️", barColor: "bg-orange-500",
        badgeColor: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        description: "Crop images visually with preset ratios or custom dimensions. Pixel-perfect results.",
        accepts: "image/jpeg,image/png,image/webp,image/gif", acceptLabel: "JPG, PNG, WebP, or GIF",
        tips: ["Use 1:1 for profile pictures, 16:9 for YouTube thumbnails", "Click and drag on the image to select your crop area", "Crop before resizing for best quality"],
      };
    case "image-to-base64":
      return {
        icon: "🔤", barColor: "bg-cyan-500",
        badgeColor: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
        description: "Convert any image to a Base64 data URI. Embed images directly in HTML, CSS, or JSON.",
        accepts: "image/jpeg,image/png,image/webp,image/gif,image/svg+xml", acceptLabel: "Any image format",
        tips: ["Base64 increases file size by ~33% — use for small icons and logos only", "Data URIs eliminate HTTP requests — faster initial load for tiny images", "Copy the CSS background-image version for stylesheet use"],
      };
    case "svg-to-png":
      return {
        icon: "🖼️", barColor: "bg-pink-500",
        badgeColor: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        description: "Convert SVG vector graphics to PNG raster images at any resolution.",
        accepts: "image/svg+xml", acceptLabel: "SVG files only",
        tips: ["Set a higher scale (2x, 3x) for retina-quality exports", "SVGs with external fonts may not render — embed fonts first", "Transparent background is preserved in PNG output"],
      };
  }
}

/* ─── File size formatting ───────────────────────────────────────────────────── */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pctSaved(original: number, compressed: number): string {
  if (original <= 0) return "0%";
  return `${Math.round((1 - compressed / original) * 100)}%`;
}

/* ─── Canvas processing functions ────────────────────────────────────────────── */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      type,
      quality
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getOutputMime(format: string): string {
  switch (format) {
    case "jpg": case "jpeg": return "image/jpeg";
    case "png": return "image/png";
    case "webp": return "image/webp";
    default: return "image/png";
  }
}

function getExtFromMime(mime: string): string {
  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("bmp")) return "bmp";
  if (mime.includes("gif")) return "gif";
  return "png";
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function FileToolRenderer({ family, title }: Props) {
  const identity = useMemo(() => getIdentity(family), [family]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; filename: string } | null>(null);
  const [base64Result, setBase64Result] = useState("");
  const [error, setError] = useState("");

  // Tool-specific settings
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("webp");
  const [resizeWidth, setResizeWidth] = useState("");
  const [resizeHeight, setResizeHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [svgScale, setSvgScale] = useState("2");

  // Crop state
  const [cropX, setCropX] = useState("");
  const [cropY, setCropY] = useState("");
  const [cropW, setCropW] = useState("");
  const [cropH, setCropH] = useState("");
  const [cropPreset, setCropPreset] = useState("free");

  /* ─── File handling ──────────────────────────────────────────────────────── */

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setBase64Result("");
    setError("");

    const url = URL.createObjectURL(f);
    setPreview(url);

    const img = new Image();
    img.onload = () => {
      setImgDims({ w: img.naturalWidth, h: img.naturalHeight });
      if (family === "image-resizer") {
        setResizeWidth(String(img.naturalWidth));
        setResizeHeight(String(img.naturalHeight));
      }
      if (family === "image-cropper") {
        setCropX("0");
        setCropY("0");
        setCropW(String(img.naturalWidth));
        setCropH(String(img.naturalHeight));
      }
    };
    img.src = url;
  }, [family]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  /* ─── Resize with aspect ratio lock ─────────────────────────────────────── */

  const handleWidthChange = (val: string) => {
    setResizeWidth(val);
    if (lockAspect && imgDims.w > 0) {
      const ratio = imgDims.h / imgDims.w;
      setResizeHeight(String(Math.round(Number(val) * ratio)));
    }
  };

  const handleHeightChange = (val: string) => {
    setResizeHeight(val);
    if (lockAspect && imgDims.h > 0) {
      const ratio = imgDims.w / imgDims.h;
      setResizeWidth(String(Math.round(Number(val) * ratio)));
    }
  };

  /* ─── Crop presets ──────────────────────────────────────────────────────── */

  const applyCropPreset = (preset: string) => {
    setCropPreset(preset);
    if (preset === "free" || !imgDims.w) return;
    const ratios: Record<string, [number, number]> = {
      "1:1": [1, 1], "16:9": [16, 9], "4:3": [4, 3], "3:2": [3, 2], "9:16": [9, 16],
    };
    const [rw, rh] = ratios[preset] || [1, 1];
    const maxW = imgDims.w;
    const maxH = imgDims.h;
    let w = maxW;
    let h = Math.round(w * rh / rw);
    if (h > maxH) { h = maxH; w = Math.round(h * rw / rh); }
    setCropX(String(Math.round((maxW - w) / 2)));
    setCropY(String(Math.round((maxH - h) / 2)));
    setCropW(String(w));
    setCropH(String(h));
  };

  /* ─── Processing ────────────────────────────────────────────────────────── */

  const process = async () => {
    if (!file) return;
    setProcessing(true);
    setError("");
    setResult(null);
    setBase64Result("");

    try {
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const baseName = file.name.replace(/\.[^.]+$/, "");

      switch (family) {
        case "image-compressor": {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          ctx.drawImage(img, 0, 0);
          const mime = getOutputMime(outputFormat);
          const blob = await canvasToBlob(canvas, mime, quality / 100);
          const url = URL.createObjectURL(blob);
          setResult({ blob, url, filename: `${baseName}-compressed.${outputFormat}` });
          break;
        }

        case "image-resizer": {
          const w = parseInt(resizeWidth) || img.naturalWidth;
          const h = parseInt(resizeHeight) || img.naturalHeight;
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          const ext = getExtFromMime(file.type);
          const mime = getOutputMime(ext);
          const blob = await canvasToBlob(canvas, mime, 0.92);
          const url = URL.createObjectURL(blob);
          setResult({ blob, url, filename: `${baseName}-${w}x${h}.${ext}` });
          break;
        }

        case "image-converter": {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          // For JPG output, fill white background (no transparency)
          if (outputFormat === "jpg" || outputFormat === "jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);
          const mime = getOutputMime(outputFormat);
          const q = outputFormat === "png" ? 1 : quality / 100;
          const blob = await canvasToBlob(canvas, mime, q);
          const url = URL.createObjectURL(blob);
          setResult({ blob, url, filename: `${baseName}.${outputFormat}` });
          break;
        }

        case "image-cropper": {
          const cx = parseInt(cropX) || 0;
          const cy = parseInt(cropY) || 0;
          const cw = parseInt(cropW) || img.naturalWidth;
          const ch = parseInt(cropH) || img.naturalHeight;
          canvas.width = cw;
          canvas.height = ch;
          ctx.drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
          const ext = getExtFromMime(file.type);
          const mime = getOutputMime(ext);
          const blob = await canvasToBlob(canvas, mime, 0.92);
          const url = URL.createObjectURL(blob);
          setResult({ blob, url, filename: `${baseName}-cropped.${ext}` });
          break;
        }

        case "image-to-base64": {
          const reader = new FileReader();
          const dataUri = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          setBase64Result(dataUri);
          break;
        }

        case "svg-to-png": {
          const scale = parseInt(svgScale) || 2;
          canvas.width = img.naturalWidth * scale;
          canvas.height = img.naturalHeight * scale;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const blob = await canvasToBlob(canvas, "image/png", 1);
          const url = URL.createObjectURL(blob);
          setResult({ blob, url, filename: `${baseName}-${scale}x.png` });
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed. Try a different file.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setBase64Result("");
    setError("");
    setImgDims({ w: 0, h: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── Render ────────────────────────────────────────────────────────────── */

  return (
    <section className={cls.card}>
      {/* Header */}
      <div className="mb-6">
        <div className={cls.accentBar(identity.barColor)} />
        <div className="mt-4 flex items-start gap-3">
          <span className="text-2xl">{identity.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-q-text md:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-q-muted">{identity.description}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={cls.badge(identity.badgeColor)}>Browser-based</span>
          <span className={cls.badge("border-q-border bg-q-bg text-q-muted")}>Files never uploaded</span>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Left column: upload + settings + result */}
        <div className="space-y-5">
          {/* Drop zone */}
          {!file ? (
            <div
              className={`${cls.dropzone} ${dragging ? cls.dropzoneActive : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={identity.accepts}
                onChange={onFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-3">{identity.icon}</div>
              <div className="text-sm font-medium text-q-text">
                Drop your image here or <span className="text-q-primary underline">browse</span>
              </div>
              <div className="mt-1 text-xs text-q-muted">{identity.acceptLabel} · Max 20MB</div>
            </div>
          ) : (
            /* File loaded: show preview + settings */
            <div className="space-y-4">
              {/* Preview + file info */}
              <div className={cls.panel}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className={cls.sectionTitle}>Original</div>
                    <div className="mt-1 text-sm text-q-text font-medium">{file.name}</div>
                    <div className="text-xs text-q-muted">{imgDims.w}×{imgDims.h} · {formatSize(file.size)}</div>
                  </div>
                  <button onClick={reset} className="text-xs text-q-muted hover:text-red-500 transition">✕ Remove</button>
                </div>
                {preview && family !== "image-to-base64" && (
                  <img src={preview} alt="Preview" className={cls.previewImg} />
                )}
              </div>

              {/* Tool-specific settings */}
              {family === "image-compressor" && (
                <div className={cls.panel}>
                  <div className={cls.sectionTitle}>Compression Settings</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={cls.label}>Quality: {quality}%</label>
                      <input
                        type="range" min="10" max="100" value={quality}
                        onChange={e => setQuality(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                      <div className="flex justify-between text-xs text-q-muted mt-1">
                        <span>Smallest file</span>
                        <span>Best quality</span>
                      </div>
                    </div>
                    <div>
                      <label className={cls.label}>Output format</label>
                      <div className="flex gap-2">
                        {["webp", "jpg", "png"].map(fmt => (
                          <button key={fmt} onClick={() => setOutputFormat(fmt)}
                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium uppercase transition ${outputFormat === fmt ? "border-transparent bg-q-primary text-white" : "border-q-border bg-q-card text-q-muted hover:text-q-text"}`}>
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {family === "image-resizer" && (
                <div className={cls.panel}>
                  <div className={cls.sectionTitle}>Resize Settings</div>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={cls.label}>Width (px)</label>
                        <input type="number" value={resizeWidth} onChange={e => handleWidthChange(e.target.value)} className={cls.input} />
                      </div>
                      <div>
                        <label className={cls.label}>Height (px)</label>
                        <input type="number" value={resizeHeight} onChange={e => handleHeightChange(e.target.value)} className={cls.input} />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-q-muted cursor-pointer">
                      <input type="checkbox" checked={lockAspect} onChange={e => setLockAspect(e.target.checked)} className="accent-blue-500" />
                      Lock aspect ratio
                    </label>
                    <div>
                      <label className={cls.label}>Quick presets</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: "HD 1280×720", w: 1280, h: 720 },
                          { label: "Full HD 1920×1080", w: 1920, h: 1080 },
                          { label: "Instagram 1080×1080", w: 1080, h: 1080 },
                          { label: "Twitter 1200×675", w: 1200, h: 675 },
                          { label: "Thumbnail 300×200", w: 300, h: 200 },
                        ].map(p => (
                          <button key={p.label} onClick={() => { setResizeWidth(String(p.w)); setResizeHeight(String(p.h)); setLockAspect(false); }}
                            className="rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-muted hover:text-q-text hover:border-q-text/20 transition">
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {family === "image-converter" && (
                <div className={cls.panel}>
                  <div className={cls.sectionTitle}>Convert to</div>
                  <div className="mt-4 flex gap-2">
                    {["png", "jpg", "webp"].map(fmt => (
                      <button key={fmt} onClick={() => setOutputFormat(fmt)}
                        className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium uppercase transition ${outputFormat === fmt ? "border-transparent bg-q-primary text-white" : "border-q-border bg-q-card text-q-muted hover:text-q-text"}`}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                  {(outputFormat === "jpg" || outputFormat === "webp") && (
                    <div className="mt-4">
                      <label className={cls.label}>Quality: {quality}%</label>
                      <input type="range" min="10" max="100" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full accent-violet-500" />
                    </div>
                  )}
                </div>
              )}

              {family === "image-cropper" && (
                <div className={cls.panel}>
                  <div className={cls.sectionTitle}>Crop Settings</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className={cls.label}>Aspect ratio preset</label>
                      <div className="flex flex-wrap gap-2">
                        {["free", "1:1", "16:9", "4:3", "3:2", "9:16"].map(p => (
                          <button key={p} onClick={() => applyCropPreset(p)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${cropPreset === p ? "border-transparent bg-q-primary text-white" : "border-q-border bg-q-card text-q-muted hover:text-q-text"}`}>
                            {p === "free" ? "Free" : p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div><label className={cls.label}>X</label><input type="number" value={cropX} onChange={e => setCropX(e.target.value)} className={cls.input} /></div>
                      <div><label className={cls.label}>Y</label><input type="number" value={cropY} onChange={e => setCropY(e.target.value)} className={cls.input} /></div>
                      <div><label className={cls.label}>Width</label><input type="number" value={cropW} onChange={e => setCropW(e.target.value)} className={cls.input} /></div>
                      <div><label className={cls.label}>Height</label><input type="number" value={cropH} onChange={e => setCropH(e.target.value)} className={cls.input} /></div>
                    </div>
                  </div>
                </div>
              )}

              {family === "svg-to-png" && (
                <div className={cls.panel}>
                  <div className={cls.sectionTitle}>Export Settings</div>
                  <div className="mt-4">
                    <label className={cls.label}>Scale</label>
                    <div className="flex gap-2">
                      {["1", "2", "3", "4"].map(s => (
                        <button key={s} onClick={() => setSvgScale(s)}
                          className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${svgScale === s ? "border-transparent bg-q-primary text-white" : "border-q-border bg-q-card text-q-muted hover:text-q-text"}`}>
                          {s}x {s === "1" ? "(original)" : s === "2" ? "(retina)" : s === "3" ? "(print)" : "(ultra)"}
                        </button>
                      ))}
                    </div>
                    {imgDims.w > 0 && (
                      <div className="mt-2 text-xs text-q-muted">
                        Output: {imgDims.w * parseInt(svgScale)}×{imgDims.h * parseInt(svgScale)} px
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <button onClick={process} disabled={processing} className={cls.primaryBtn}>
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Processing...
                    </span>
                  ) : family === "image-compressor" ? "Compress Image"
                    : family === "image-resizer" ? "Resize Image"
                    : family === "image-converter" ? `Convert to ${outputFormat.toUpperCase()}`
                    : family === "image-cropper" ? "Crop Image"
                    : family === "image-to-base64" ? "Convert to Base64"
                    : family === "svg-to-png" ? `Export as PNG (${svgScale}x)`
                    : "Process"}
                </button>
                <button onClick={reset} className={cls.secondaryBtn}>New File</button>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Result: download */}
              {result && (
                <div className={cls.panel}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={cls.sectionTitle}>Result</div>
                    <span className={cls.badge("border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300")}>Done</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className={cls.stat}>
                      <div className={cls.statLabel}>Original</div>
                      <div className={cls.statValue}>{formatSize(file.size)}</div>
                    </div>
                    <div className={cls.stat}>
                      <div className={cls.statLabel}>Output</div>
                      <div className={cls.statValue}>{formatSize(result.blob.size)}</div>
                    </div>
                    <div className={cls.stat}>
                      <div className={cls.statLabel}>Saved</div>
                      <div className={`${cls.statValue} ${result.blob.size < file.size ? "text-emerald-600" : "text-orange-500"}`}>
                        {pctSaved(file.size, result.blob.size)}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <img src={result.url} alt="Result" className={cls.previewImg} />

                  {/* Download */}
                  <button
                    onClick={() => downloadBlob(result.blob, result.filename)}
                    className={`mt-4 w-full ${cls.primaryBtn}`}
                  >
                    ⬇ Download {result.filename}
                  </button>
                </div>
              )}

              {/* Result: Base64 */}
              {base64Result && (
                <div className={cls.panel}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={cls.sectionTitle}>Base64 Output</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(base64Result)}
                      className="text-xs text-q-primary hover:underline"
                    >
                      Copy All
                    </button>
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <label className={cls.label}>Data URI ({formatSize(base64Result.length)})</label>
                      <textarea value={base64Result} readOnly rows={4} className={`${cls.input} font-mono text-xs`} />
                    </div>
                    <div>
                      <label className={cls.label}>HTML img tag</label>
                      <textarea value={`<img src="${base64Result}" alt="" />`} readOnly rows={2} className={`${cls.input} font-mono text-xs`} />
                    </div>
                    <div>
                      <label className={cls.label}>CSS background</label>
                      <textarea value={`background-image: url(${base64Result});`} readOnly rows={2} className={`${cls.input} font-mono text-xs`} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Tips */}
        <aside className="space-y-4">
          <div className={cls.panel}>
            <div className={cls.sectionTitle}>Tips</div>
            <ul className="mt-3 space-y-2.5">
              {identity.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-q-muted">
                  <span className="mt-0.5 flex-shrink-0 text-q-primary">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <div className={cls.panel}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <div className="text-sm font-medium text-q-text">100% Private</div>
                <div className="text-xs text-q-muted">Your files are processed locally in your browser. Nothing is uploaded to any server.</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}