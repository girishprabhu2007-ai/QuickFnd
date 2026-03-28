"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════════════════
   VIDEO TOOL RENDERER
   Handles: video-to-gif, gif-maker, video-compressor
   All processing is 100% client-side — files never leave the browser.
   Uses Canvas API + gif.js (CDN) for GIF creation.
   Uses MediaRecorder API for video compression.
   ═══════════════════════════════════════════════════════════════════════════════ */

type VideoToolFamily = "video-to-gif" | "gif-maker" | "video-compressor";

type Props = {
  family: VideoToolFamily;
  title: string;
};

const cls = {
  card: "rounded-[28px] border border-q-border bg-q-card p-6 shadow-sm md:p-8",
  dropzone: "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-q-border/60 bg-q-bg/50 p-10 transition-colors cursor-pointer hover:border-violet-400/50 hover:bg-violet-50/30 dark:hover:bg-violet-900/10",
  dropzoneActive: "border-violet-400 bg-violet-50/50 dark:bg-violet-900/20",
  label: "mb-1.5 block text-xs font-semibold uppercase tracking-[0.14em] text-q-muted",
  input: "w-full rounded-xl border border-q-border bg-q-card px-4 py-3 text-q-text outline-none transition placeholder:text-q-muted/60 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10",
  panel: "rounded-2xl border border-q-border bg-q-bg p-5",
  primaryBtn: "rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50",
  secondaryBtn: "rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50",
  stat: "rounded-xl border border-q-border bg-q-card px-4 py-3 text-center",
  statLabel: "text-xs text-q-muted",
  statValue: "mt-1 text-lg font-bold text-q-text",
};

type ToolIdentity = {
  icon: string;
  barColor: string;
  description: string;
  accepts: string;
  acceptLabel: string;
  tips: string[];
};

function getIdentity(family: VideoToolFamily): ToolIdentity {
  switch (family) {
    case "video-to-gif":
      return {
        icon: "🎬",
        barColor: "bg-violet-500",
        description: "Convert video clips to animated GIFs. Trim, resize, and control frame rate.",
        accepts: "video/*",
        acceptLabel: "MP4, WebM, MOV",
        tips: ["Keep clips under 10s for best results", "Lower FPS = smaller file", "Narrower width = faster conversion"],
      };
    case "gif-maker":
      return {
        icon: "🖼️",
        barColor: "bg-pink-500",
        description: "Create animated GIFs from multiple images. Set delay and loop options.",
        accepts: "image/*",
        acceptLabel: "PNG, JPEG, WebP, GIF",
        tips: ["10-30 frames works best", "Images are resized to match the first frame", "Drag to reorder frames"],
      };
    case "video-compressor":
      return {
        icon: "📦",
        barColor: "bg-teal-500",
        description: "Reduce video file size without losing visible quality. All processing in your browser.",
        accepts: "video/*",
        acceptLabel: "MP4, WebM, MOV",
        tips: ["Medium quality works for most uses", "Longer videos take more time", "Output format depends on your browser"],
      };
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function VideoToolRenderer({ family, title }: Props) {
  const identity = useMemo(() => getIdentity(family), [family]);

  // Shared state
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState("");
  const [resultFilename, setResultFilename] = useState("");
  const [dragging, setDragging] = useState(false);

  // Video-to-GIF state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [gifWidth, setGifWidth] = useState(480);
  const [gifFps, setGifFps] = useState(10);

  // GIF Maker state
  const [frames, setFrames] = useState<{ file: File; url: string }[]>([]);
  const [frameDelay, setFrameDelay] = useState(200);
  const [gifLoop, setGifLoop] = useState(true);

  // Video Compressor state
  const [compressQuality, setCompressQuality] = useState<"low" | "medium" | "high">("medium");
  const [originalSize, setOriginalSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      frames.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setVideoFile(null);
    setVideoUrl("");
    setVideoDuration(0);
    setStartTime(0);
    setEndTime(5);
    setFrames([]);
    setResultBlob(null);
    setResultUrl("");
    setResultFilename("");
    setError("");
    setProgress(0);
    setOriginalSize(0);
  };

  /* ─── Video file handler ──────────────────────────────────────────────────── */

  const handleVideoFile = useCallback((file: File) => {
    reset();
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setOriginalSize(file.size);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      setEndTime(Math.min(video.duration, 10));
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── GIF Maker frame handler ─────────────────────────────────────────────── */

  const handleImageFiles = useCallback((files: FileList) => {
    const newFrames = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setFrames((prev) => [...prev, ...newFrames]);
  }, []);

  const removeFrame = (index: number) => {
    setFrames((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  /* ─── Drop handlers ───────────────────────────────────────────────────────── */

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (family === "gif-maker") {
        handleImageFiles(e.dataTransfer.files);
      } else {
        const f = e.dataTransfer.files[0];
        if (f) handleVideoFile(f);
      }
    },
    [family, handleVideoFile, handleImageFiles]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (family === "gif-maker") {
        if (e.target.files) handleImageFiles(e.target.files);
      } else {
        const f = e.target.files?.[0];
        if (f) handleVideoFile(f);
      }
    },
    [family, handleVideoFile, handleImageFiles]
  );

  /* ─── Video to GIF conversion ─────────────────────────────────────────────── */

  const convertVideoToGif = async () => {
    if (!videoFile) return;
    setProcessing(true);
    setError("");
    setProgress(0);

    try {
      // Load gif.js from CDN
      await loadGifJs();

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(videoFile);

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.load();
      });

      const aspectRatio = video.videoHeight / video.videoWidth;
      const outW = gifWidth;
      const outH = Math.round(gifWidth * aspectRatio);

      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const GIF = (window as any).GIF;
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: outW,
        height: outH,
        workerScript: "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
      });

      const clipDuration = endTime - startTime;
      const totalFrames = Math.floor(clipDuration * gifFps);
      const interval = 1 / gifFps;

      for (let i = 0; i < totalFrames; i++) {
        video.currentTime = startTime + i * interval;
        await new Promise<void>((resolve) => {
          video.onseeked = () => resolve();
        });
        ctx.drawImage(video, 0, 0, outW, outH);
        gif.addFrame(ctx.getImageData(0, 0, outW, outH), { delay: interval * 1000 });
        setProgress(Math.round(((i + 1) / totalFrames) * 80));
      }

      const blob = await new Promise<Blob>((resolve) => {
        gif.on("finished", (blob: Blob) => resolve(blob));
        gif.render();
      });

      setProgress(100);
      const url = URL.createObjectURL(blob);
      const baseName = videoFile.name.replace(/\.[^.]+$/, "");
      setResultBlob(blob);
      setResultUrl(url);
      setResultFilename(`${baseName}.gif`);

      URL.revokeObjectURL(video.src);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GIF conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  /* ─── GIF Maker ───────────────────────────────────────────────────────────── */

  const createGifFromFrames = async () => {
    if (frames.length < 2) {
      setError("Please add at least 2 images");
      return;
    }
    setProcessing(true);
    setError("");
    setProgress(0);

    try {
      await loadGifJs();

      // Load first image to determine size
      const firstImg = await loadImage(frames[0].file);
      const w = firstImg.naturalWidth;
      const h = firstImg.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const GIF = (window as any).GIF;
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: w,
        height: h,
        repeat: gifLoop ? 0 : -1,
        workerScript: "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js",
      });

      for (let i = 0; i < frames.length; i++) {
        const img = await loadImage(frames[i].file);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        gif.addFrame(ctx.getImageData(0, 0, w, h), { delay: frameDelay });
        setProgress(Math.round(((i + 1) / frames.length) * 80));
      }

      const blob = await new Promise<Blob>((resolve) => {
        gif.on("finished", (blob: Blob) => resolve(blob));
        gif.render();
      });

      setProgress(100);
      const url = URL.createObjectURL(blob);
      setResultBlob(blob);
      setResultUrl(url);
      setResultFilename("animation.gif");
    } catch (err) {
      setError(err instanceof Error ? err.message : "GIF creation failed");
    } finally {
      setProcessing(false);
    }
  };

  /* ─── Video Compressor ────────────────────────────────────────────────────── */

  const compressVideo = async () => {
    if (!videoFile) return;
    setProcessing(true);
    setError("");
    setProgress(0);

    try {
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(videoFile);

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        video.load();
      });

      const bitrates: Record<string, number> = {
        low: 500_000,
        medium: 1_000_000,
        high: 2_500_000,
      };

      const canvas = document.createElement("canvas");
      const scale = compressQuality === "low" ? 0.5 : compressQuality === "medium" ? 0.75 : 1;
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext("2d")!;

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: bitrates[compressQuality],
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const done = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
        };
      });

      recorder.start();
      video.play();

      const drawFrame = () => {
        if (video.ended || video.paused) {
          recorder.stop();
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setProgress(Math.round((video.currentTime / video.duration) * 100));
        requestAnimationFrame(drawFrame);
      };
      drawFrame();

      const blob = await done;
      setProgress(100);
      const url = URL.createObjectURL(blob);
      const ext = mimeType.includes("webm") ? "webm" : "mp4";
      const baseName = videoFile.name.replace(/\.[^.]+$/, "");
      setResultBlob(blob);
      setResultUrl(url);
      setResultFilename(`${baseName}-compressed.${ext}`);

      URL.revokeObjectURL(video.src);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  /* ─── Process dispatch ────────────────────────────────────────────────────── */

  const handleProcess = () => {
    if (family === "video-to-gif") convertVideoToGif();
    else if (family === "gif-maker") createGifFromFrames();
    else if (family === "video-compressor") compressVideo();
  };

  const canProcess =
    family === "gif-maker" ? frames.length >= 2 : !!videoFile;

  /* ─── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div className={cls.card}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-1 w-10 rounded-full ${identity.barColor}`} />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-q-muted">
            Tool Workspace
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-q-text md:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted">{identity.description}</p>
      </div>

      {/* Upload Area */}
      {!resultBlob && (
        <>
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
              multiple={family === "gif-maker"}
              className="hidden"
              onChange={onFileSelect}
            />
            <div className="text-3xl mb-3">{identity.icon}</div>
            <p className="text-sm font-medium text-q-text">
              {family === "gif-maker" ? "Drop images or click to upload" : "Drop a video or click to upload"}
            </p>
            <p className="mt-1 text-xs text-q-muted">{identity.acceptLabel}</p>
          </div>

          {/* GIF Maker frames preview */}
          {family === "gif-maker" && frames.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className={cls.label}>{frames.length} frame{frames.length !== 1 ? "s" : ""}</span>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-violet-500 font-medium">
                  + Add more
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {frames.map((f, i) => (
                  <div key={i} className="relative shrink-0 group">
                    <img src={f.url} alt={`Frame ${i + 1}`} className="h-20 w-20 rounded-lg border border-q-border object-cover" />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFrame(i); }}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                    >
                      x
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[9px] text-white">{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video preview */}
          {(family === "video-to-gif" || family === "video-compressor") && videoUrl && (
            <div className="mt-4">
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full max-h-[300px] rounded-xl border border-q-border"
              />
              <div className="mt-2 flex gap-4">
                <div className={cls.stat}>
                  <div className={cls.statLabel}>Size</div>
                  <div className={cls.statValue}>{formatBytes(originalSize)}</div>
                </div>
                <div className={cls.stat}>
                  <div className={cls.statLabel}>Duration</div>
                  <div className={cls.statValue}>{videoDuration.toFixed(1)}s</div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {canProcess && (
            <div className={`mt-4 ${cls.panel}`}>
              <span className={cls.label}>Settings</span>

              {family === "video-to-gif" && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={cls.label}>Start time (s)</label>
                    <input type="number" min={0} max={videoDuration} step={0.1} value={startTime}
                      onChange={(e) => setStartTime(Number(e.target.value))} className={cls.input} />
                  </div>
                  <div>
                    <label className={cls.label}>End time (s)</label>
                    <input type="number" min={0} max={videoDuration} step={0.1} value={endTime}
                      onChange={(e) => setEndTime(Number(e.target.value))} className={cls.input} />
                  </div>
                  <div>
                    <label className={cls.label}>Width (px)</label>
                    <input type="number" min={100} max={1920} value={gifWidth}
                      onChange={(e) => setGifWidth(Number(e.target.value))} className={cls.input} />
                  </div>
                  <div>
                    <label className={cls.label}>Frame rate (FPS)</label>
                    <input type="number" min={2} max={30} value={gifFps}
                      onChange={(e) => setGifFps(Number(e.target.value))} className={cls.input} />
                  </div>
                </div>
              )}

              {family === "gif-maker" && (
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={cls.label}>Frame delay (ms)</label>
                    <input type="number" min={50} max={2000} step={50} value={frameDelay}
                      onChange={(e) => setFrameDelay(Number(e.target.value))} className={cls.input} />
                  </div>
                  <div>
                    <label className={cls.label}>Loop</label>
                    <select value={gifLoop ? "yes" : "no"}
                      onChange={(e) => setGifLoop(e.target.value === "yes")} className={cls.input}>
                      <option value="yes">Loop forever</option>
                      <option value="no">Play once</option>
                    </select>
                  </div>
                </div>
              )}

              {family === "video-compressor" && (
                <div className="mt-3">
                  <label className={cls.label}>Quality</label>
                  <div className="mt-2 flex gap-2">
                    {(["low", "medium", "high"] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setCompressQuality(q)}
                        className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                          compressQuality === q
                            ? "bg-violet-600 text-white shadow-sm"
                            : "border border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
                        }`}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-q-muted">
                    {compressQuality === "low" && "Smallest file, 50% resolution. Good for sharing on messaging apps."}
                    {compressQuality === "medium" && "Balanced quality and size, 75% resolution. Good for most uses."}
                    {compressQuality === "high" && "Best quality, full resolution. Smaller file through bitrate reduction."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Process button */}
          {canProcess && (
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleProcess} disabled={processing} className={cls.primaryBtn}>
                {processing ? `Processing… ${progress}%` : family === "video-to-gif" ? "Convert to GIF" : family === "gif-maker" ? "Create GIF" : "Compress Video"}
              </button>
              <button onClick={reset} className={cls.secondaryBtn}>Reset</button>
            </div>
          )}

          {/* Progress bar */}
          {processing && (
            <div className="mt-4 h-2 w-full rounded-full bg-q-bg overflow-hidden">
              <div
                className={`h-full rounded-full ${identity.barColor} transition-all duration-300`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      )}

      {/* Result */}
      {resultBlob && (
        <div className={cls.panel}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-1 w-8 rounded-full ${identity.barColor}`} />
            <span className={cls.label}>Result</span>
          </div>

          {/* Preview */}
          {family === "video-compressor" ? (
            <video src={resultUrl} controls className="w-full max-h-[300px] rounded-xl border border-q-border" />
          ) : (
            <img src={resultUrl} alt="Result GIF" className="max-h-[300px] max-w-full rounded-xl border border-q-border" />
          )}

          {/* Stats */}
          <div className="mt-4 flex gap-4">
            <div className={cls.stat}>
              <div className={cls.statLabel}>Output size</div>
              <div className={cls.statValue}>{formatBytes(resultBlob.size)}</div>
            </div>
            {originalSize > 0 && family === "video-compressor" && (
              <div className={cls.stat}>
                <div className={cls.statLabel}>Reduction</div>
                <div className={cls.statValue}>{Math.round((1 - resultBlob.size / originalSize) * 100)}%</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => downloadBlob(resultBlob, resultFilename)} className={cls.primaryBtn}>
              Download {resultFilename}
            </button>
            <button onClick={reset} className={cls.secondaryBtn}>
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {identity.tips.map((tip, i) => (
          <span key={i} className="inline-flex items-center rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-muted">
            {tip}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

let gifJsLoaded = false;
function loadGifJs(): Promise<void> {
  if (gifJsLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js";
    script.onload = () => { gifJsLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load gif.js from CDN"));
    document.head.appendChild(script);
  });
}
