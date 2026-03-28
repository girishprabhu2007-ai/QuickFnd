"use client";

export default function OfflinePage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="text-2xl font-bold text-q-text mb-3">
          You&apos;re Offline
        </h1>
        <p className="text-q-muted mb-6">
          It looks like you&apos;ve lost your internet connection. QuickFnd
          needs a connection to load tools and calculators.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-xl bg-q-accent text-white font-semibold hover:opacity-90 transition"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}