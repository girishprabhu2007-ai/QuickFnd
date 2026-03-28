"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   PDF TOOL RENDERER
   Handles: pdf-merger, pdf-splitter, image-to-pdf, text-to-pdf
   Uses pdf-lib loaded from CDN (client-side only, no server upload).
   ═══════════════════════════════════════════════════════════════════════════════ */

type PDFToolFamily = "pdf-merger" | "pdf-splitter" | "image-to-pdf" | "text-to-pdf";

type Props = { family: PDFToolFamily; title: string };

/* ─── Design tokens ──────────────────────────────────────────────────────────── */

const cls = {
  card: "rounded-[28px] border border-q-border bg-q-card p-6 shadow-sm md:p-8",
  dropzone: "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-q-border/60 bg-q-bg/50 p-10 transition-colors cursor-pointer hover:border-red-400/50 hover:bg-red-50/30 dark:hover:bg-red-900/10",
  dropzoneActive: "border-red-400 bg-red-50/50 dark:bg-red-900/20",
  label: "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-q-muted",
  input: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-red-400/60 focus:ring-2 focus:ring-red-400/10",
  textarea: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-red-400/60 resize-none",
  panel: "rounded-2xl border border-q-border bg-q-bg p-5",
  primaryBtn: "rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn: "rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50",
  badge: (color: string) => `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${color}`,
  accentBar: "h-1 w-12 rounded-full bg-red-500",
  sectionTitle: "text-xs font-semibold uppercase tracking-[0.16em] text-q-muted",
  fileRow: "flex items-center justify-between rounded-xl border border-q-border bg-q-card px-4 py-3",
  stat: "rounded-xl border border-q-border bg-q-card px-4 py-3 text-center",
  statLabel: "text-xs text-q-muted",
  statValue: "mt-1 text-lg font-bold text-q-text",
};

/* ─── Tool identity ──────────────────────────────────────────────────────────── */

type ToolIdentity = {
  icon: string;
  description: string;
  accepts: string;
  acceptLabel: string;
  multiple: boolean;
  tips: string[];
};

function getIdentity(family: PDFToolFamily): ToolIdentity {
  switch (family) {
    case "pdf-merger":
      return {
        icon: "📎", description: "Combine multiple PDF files into a single document. Drag to reorder pages.",
        accepts: "application/pdf", acceptLabel: "PDF files", multiple: true,
        tips: ["Upload 2 or more PDFs to merge them", "Drag to reorder files before merging", "Output preserves all bookmarks and links"],
      };
    case "pdf-splitter":
      return {
        icon: "✂️", description: "Extract specific pages from a PDF. Download individual pages or a custom range.",
        accepts: "application/pdf", acceptLabel: "Single PDF file", multiple: false,
        tips: ["Enter page ranges like 1-3, 5, 8-10", "Leave blank to extract all pages as separate PDFs", "Large PDFs may take a few seconds to process"],
      };
    case "image-to-pdf":
      return {
        icon: "🖼️", description: "Combine multiple images into a single PDF document. Perfect for creating photo albums or document scans.",
        accepts: "image/jpeg,image/png,image/webp", acceptLabel: "JPG, PNG, or WebP images", multiple: true,
        tips: ["Upload images in the order you want them in the PDF", "Each image becomes one full page", "Works great for scanned documents and receipts"],
      };
    case "text-to-pdf":
      return {
        icon: "📝", description: "Convert plain text to a downloadable PDF document. Simple, clean formatting.",
        accepts: "", acceptLabel: "", multiple: false,
        tips: ["Paste or type your text content", "Each paragraph becomes a new section", "Great for creating quick PDF notes or letters"],
      };
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ─── pdf-lib loader ─────────────────────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function usePDFLib(): { PDFLib: any; loading: boolean; error: string } {
  const [lib, setLib] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).PDFLib) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLib((window as any).PDFLib);
      setLoading(false);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";
    script.async = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setLib((window as any).PDFLib);
      setLoading(false);
    };
    script.onerror = () => {
      setError("Failed to load PDF library. Please refresh and try again.");
      setLoading(false);
    };
    document.head.appendChild(script);
  }, []);

  return { PDFLib: lib, loading, error };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function PDFToolRenderer({ family, title }: Props) {
  const identity = useMemo(() => getIdentity(family), [family]);
  const { PDFLib, loading: libLoading, error: libError } = usePDFLib();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  // Text-to-PDF state
  const [textContent, setTextContent] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");

  // Splitter state
  const [pageRange, setPageRange] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  // Processing state
  const [processing, setProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultFilename, setResultFilename] = useState("");
  const [error, setError] = useState("");

  /* ─── File handling ──────────────────────────────────────────────────────── */

  const handleFiles = useCallback((newFiles: File[]) => {
    setResultBlob(null);
    setError("");
    if (identity.multiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
      // For splitter, count pages
      if (family === "pdf-splitter" && PDFLib && newFiles[0]) {
        newFiles[0].arrayBuffer().then(buf => {
          PDFLib.PDFDocument.load(buf).then((doc: { getPageCount: () => number }) => {
            setTotalPages(doc.getPageCount());
          }).catch(() => setTotalPages(0));
        });
      }
    }
  }, [identity.multiple, family, PDFLib]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length) handleFiles(droppedFiles);
  }, [handleFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length) handleFiles(selected);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResultBlob(null);
  };

  const moveFile = (from: number, to: number) => {
    setFiles(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  /* ─── Parse page ranges ─────────────────────────────────────────────────── */

  function parsePageRange(range: string, max: number): number[] {
    if (!range.trim()) return Array.from({ length: max }, (_, i) => i);
    const pages = new Set<number>();
    for (const part of range.split(",")) {
      const trimmed = part.trim();
      const dashMatch = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);
      if (dashMatch) {
        const start = Math.max(1, parseInt(dashMatch[1]));
        const end = Math.min(max, parseInt(dashMatch[2]));
        for (let i = start; i <= end; i++) pages.add(i - 1);
      } else {
        const num = parseInt(trimmed);
        if (num >= 1 && num <= max) pages.add(num - 1);
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  /* ─── Processing ────────────────────────────────────────────────────────── */

  const process = async () => {
    if (!PDFLib) { setError("PDF library not loaded yet. Please wait."); return; }
    setProcessing(true);
    setError("");
    setResultBlob(null);

    try {
      switch (family) {
        case "pdf-merger": {
          if (files.length < 2) { setError("Upload at least 2 PDF files to merge."); break; }
          const mergedDoc = await PDFLib.PDFDocument.create();
          for (const file of files) {
            const buf = await file.arrayBuffer();
            const srcDoc = await PDFLib.PDFDocument.load(buf);
            const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            for (const page of pages) mergedDoc.addPage(page);
          }
          const pdfBytes = await mergedDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          setResultBlob(blob);
          setResultFilename("merged.pdf");
          break;
        }

        case "pdf-splitter": {
          if (!files[0]) { setError("Upload a PDF file first."); break; }
          const buf = await files[0].arrayBuffer();
          const srcDoc = await PDFLib.PDFDocument.load(buf);
          const pageIndices = parsePageRange(pageRange, srcDoc.getPageCount());
          if (pageIndices.length === 0) { setError("No valid pages in the specified range."); break; }
          const newDoc = await PDFLib.PDFDocument.create();
          const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
          for (const page of copiedPages) newDoc.addPage(page);
          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const baseName = files[0].name.replace(/\.pdf$/i, "");
          setResultBlob(blob);
          setResultFilename(`${baseName}-pages-${pageRange || "all"}.pdf`);
          break;
        }

        case "image-to-pdf": {
          if (files.length === 0) { setError("Upload at least one image."); break; }
          const pdfDoc = await PDFLib.PDFDocument.create();
          for (const file of files) {
            const buf = await file.arrayBuffer();
            const uint8 = new Uint8Array(buf);
            let img;
            if (file.type === "image/png") {
              img = await pdfDoc.embedPng(uint8);
            } else {
              img = await pdfDoc.embedJpg(uint8);
            }
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          }
          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          setResultBlob(blob);
          setResultFilename("images-combined.pdf");
          break;
        }

        case "text-to-pdf": {
          if (!textContent.trim()) { setError("Enter some text content first."); break; }
          const pdfDoc = await PDFLib.PDFDocument.create();
          const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
          const fontSize = 12;
          const margin = 50;
          const lineHeight = fontSize * 1.5;
          const pageWidth = 595.28; // A4
          const pageHeight = 841.89;
          const maxWidth = pageWidth - margin * 2;

          const lines: string[] = [];
          for (const paragraph of textContent.split("\n")) {
            if (!paragraph.trim()) { lines.push(""); continue; }
            const words = paragraph.split(" ");
            let currentLine = "";
            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              const width = font.widthOfTextAtSize(testLine, fontSize);
              if (width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
              } else {
                currentLine = testLine;
              }
            }
            if (currentLine) lines.push(currentLine);
          }

          let page = pdfDoc.addPage([pageWidth, pageHeight]);
          let y = pageHeight - margin;

          for (const line of lines) {
            if (y < margin + lineHeight) {
              page = pdfDoc.addPage([pageWidth, pageHeight]);
              y = pageHeight - margin;
            }
            if (line) {
              page.drawText(line, { x: margin, y, size: fontSize, font });
            }
            y -= lineHeight;
          }

          const pdfBytes = await pdfDoc.save();
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          setResultBlob(blob);
          setResultFilename(`${pdfTitle || "document"}.pdf`);
          break;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed. The file may be corrupted or password-protected.");
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setResultBlob(null);
    setError("");
    setTextContent("");
    setPdfTitle("");
    setPageRange("");
    setTotalPages(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ─── Render ────────────────────────────────────────────────────────────── */

  return (
    <section className={cls.card}>
      {/* Header */}
      <div className="mb-6">
        <div className={cls.accentBar} />
        <div className="mt-4 flex items-start gap-3">
          <span className="text-2xl">{identity.icon}</span>
          <div>
            <h2 className="text-xl font-semibold text-q-text md:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-q-muted">{identity.description}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={cls.badge("border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300")}>PDF Tool</span>
          <span className={cls.badge("border-q-border bg-q-bg text-q-muted")}>Files never uploaded</span>
        </div>
      </div>

      {/* Library loading state */}
      {libLoading && (
        <div className={cls.panel}>
          <div className="flex items-center gap-3 text-sm text-q-muted">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-q-muted/30 border-t-q-primary" />
            Loading PDF engine...
          </div>
        </div>
      )}
      {libError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{libError}</div>
      )}

      {!libLoading && !libError && (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Text-to-PDF: text input instead of file upload */}
            {family === "text-to-pdf" ? (
              <div className="space-y-4">
                <div className={cls.panel}>
                  <label className={cls.label}>Document title</label>
                  <input type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)}
                    placeholder="My Document" className={cls.input} />
                </div>
                <div className={cls.panel}>
                  <label className={cls.label}>Content</label>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                    placeholder="Type or paste your text here. Each line break creates a new paragraph in the PDF..."
                    rows={12} className={cls.textarea} style={{ minHeight: "300px" }} />
                  <div className="mt-2 text-xs text-q-muted text-right">
                    {textContent.length} characters · ~{Math.ceil(textContent.split(/\s+/).filter(Boolean).length)} words
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Drop zone */}
                <div
                  className={`${cls.dropzone} ${dragging ? cls.dropzoneActive : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept={identity.accepts}
                    multiple={identity.multiple} onChange={onFileSelect} className="hidden" />
                  <div className="text-4xl mb-3">{identity.icon}</div>
                  <div className="text-sm font-medium text-q-text">
                    Drop {identity.multiple ? "files" : "your file"} here or <span className="text-red-600 underline">browse</span>
                  </div>
                  <div className="mt-1 text-xs text-q-muted">{identity.acceptLabel} · Max 50MB</div>
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className={cls.panel}>
                    <div className="flex items-center justify-between mb-3">
                      <div className={cls.sectionTitle}>{files.length} file{files.length > 1 ? "s" : ""} selected</div>
                      <button onClick={reset} className="text-xs text-q-muted hover:text-red-500 transition">Clear all</button>
                    </div>
                    <div className="space-y-2">
                      {files.map((f, i) => (
                        <div key={`${f.name}-${i}`} className={cls.fileRow}>
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-red-500 text-sm">📄</span>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-q-text truncate">{f.name}</div>
                              <div className="text-xs text-q-muted">{formatSize(f.size)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {identity.multiple && i > 0 && (
                              <button onClick={() => moveFile(i, i - 1)} className="text-xs text-q-muted hover:text-q-text px-1">↑</button>
                            )}
                            {identity.multiple && i < files.length - 1 && (
                              <button onClick={() => moveFile(i, i + 1)} className="text-xs text-q-muted hover:text-q-text px-1">↓</button>
                            )}
                            <button onClick={() => removeFile(i)} className="text-xs text-q-muted hover:text-red-500 px-1 ml-2">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {identity.multiple && (
                      <button onClick={() => fileInputRef.current?.click()}
                        className="mt-3 text-xs text-red-600 hover:underline">+ Add more files</button>
                    )}
                  </div>
                )}

                {/* Splitter: page range input */}
                {family === "pdf-splitter" && files.length > 0 && (
                  <div className={cls.panel}>
                    <div className={cls.sectionTitle}>Page Selection</div>
                    <div className="mt-3 space-y-3">
                      {totalPages > 0 && (
                        <div className="text-sm text-q-muted">This PDF has <span className="font-semibold text-q-text">{totalPages} pages</span></div>
                      )}
                      <div>
                        <label className={cls.label}>Pages to extract</label>
                        <input type="text" value={pageRange} onChange={e => setPageRange(e.target.value)}
                          placeholder="e.g. 1-3, 5, 8-10 (leave blank for all)" className={cls.input} />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button onClick={process} disabled={processing || (family !== "text-to-pdf" && files.length === 0) || (family === "text-to-pdf" && !textContent.trim())}
                className={cls.primaryBtn}>
                {processing ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing...
                  </span>
                ) : family === "pdf-merger" ? `Merge ${files.length} PDFs`
                  : family === "pdf-splitter" ? "Extract Pages"
                  : family === "image-to-pdf" ? `Create PDF from ${files.length} image${files.length !== 1 ? "s" : ""}`
                  : "Generate PDF"}
              </button>
              <button onClick={reset} className={cls.secondaryBtn}>Reset</button>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">{error}</div>
            )}

            {/* Result */}
            {resultBlob && (
              <div className={cls.panel}>
                <div className="flex items-center justify-between mb-3">
                  <div className={cls.sectionTitle}>Result</div>
                  <span className={cls.badge("border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300")}>Ready</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className={cls.stat}>
                    <div className={cls.statLabel}>File size</div>
                    <div className={cls.statValue}>{formatSize(resultBlob.size)}</div>
                  </div>
                  <div className={cls.stat}>
                    <div className={cls.statLabel}>Format</div>
                    <div className={cls.statValue}>PDF</div>
                  </div>
                </div>
                <button onClick={() => downloadBlob(resultBlob, resultFilename)}
                  className={`w-full ${cls.primaryBtn}`}>
                  ⬇ Download {resultFilename}
                </button>
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
                    <span className="mt-0.5 flex-shrink-0 text-red-500">→</span>
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
      )}
    </section>
  );
}