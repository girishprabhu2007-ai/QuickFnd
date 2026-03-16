"use client";

import { useEffect, useMemo, useState } from "react";

type CurrencyMap = Record<string, string>;

export default function CurrencyConverterClient() {
  const [currencies, setCurrencies] = useState<CurrencyMap>({});
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencies(data || {});
      } catch (err) {
        console.error("Failed to load currencies:", err);
        setError("Could not load currency list.");
      } finally {
        setBootLoading(false);
      }
    }

    loadCurrencies();
  }, []);

  async function trackConvert() {
    try {
      await fetch("/api/usage/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_slug: "currency-converter",
          item_type: "tool",
          event_type: "convert",
          metadata: {
            from,
            to,
          },
        }),
      });
    } catch {}
  }

  async function convert() {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    if (from === to) {
      setResult(numericAmount);
      setRateDate("");
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `https://api.frankfurter.app/latest?amount=${encodeURIComponent(
        numericAmount
      )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

      const res = await fetch(url);
      const data = await res.json();

      const converted = data?.rates?.[to];

      if (!res.ok || !Number.isFinite(converted)) {
        throw new Error("Conversion failed.");
      }

      setResult(converted);
      setRateDate(data.date || "");
      await trackConvert();
    } catch (err) {
      console.error(err);
      setError("Could not fetch real-time exchange rates.");
      setResult(null);
      setRateDate("");
    } finally {
      setLoading(false);
    }
  }

  const options = useMemo(
    () =>
      Object.entries(currencies).map(([code, name]) => ({
        code,
        label: `${code} — ${name}`,
      })),
    [currencies]
  );

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-q-text md:text-3xl">
            Real-Time Currency Converter
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
            Convert currencies using live ECB-backed exchange rates via Frankfurter.
          </p>
        </div>
      </div>

      {bootLoading ? (
        <div className="mt-8 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
          Loading currencies...
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_120px_minmax(0,1fr)]">
            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                Amount
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
                placeholder="Amount"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                From
              </label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
              >
                {options.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  const previousFrom = from;
                  setFrom(to);
                  setTo(previousFrom);
                }}
                className="w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-semibold text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
              >
                Swap
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                To
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
              >
                {options.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={convert}
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Converting..." : "Convert"}
            </button>

            <button
              onClick={() => {
                setAmount("1");
                setFrom("USD");
                setTo("EUR");
                setResult(null);
                setRateDate("");
                setError("");
              }}
              className="rounded-xl border border-q-border bg-q-bg px-5 py-3 text-sm font-semibold text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
            >
              Reset
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {result !== null ? (
            <div className="rounded-2xl border border-q-border bg-q-bg p-5 md:p-6">
              <div className="text-2xl font-bold text-q-text">
                {amount} {from} = {result} {to}
              </div>
              {rateDate ? (
                <p className="mt-3 text-sm text-q-muted">
                  Exchange rate date: {rateDate}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}