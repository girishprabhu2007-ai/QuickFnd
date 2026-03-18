"use client";

import {
  getAdminEngineFormSchema,
  type AdminFormField,
} from "@/lib/admin-engine-form-schema";
import type { EngineCategory } from "@/lib/engine-metadata";

type Props = {
  category: EngineCategory;
  engineType: string | null | undefined;
  value: Record<string, unknown>;
  onChange: (nextValue: Record<string, unknown>) => void;
};

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400";
}

function labelClass() {
  return "mb-2 block text-sm font-medium text-q-text";
}

function normalizeListValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return "";
}

function toBoolean(value: unknown) {
  return Boolean(value);
}

function toNumberOrEmpty(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}

function buildFieldValue(field: AdminFormField, value: Record<string, unknown>) {
  const raw = value[field.key];

  if (field.type === "checkbox") return toBoolean(raw);
  if (field.type === "number") return toNumberOrEmpty(raw);
  if (field.type === "list") return normalizeListValue(raw);

  return String(raw ?? "");
}

export default function EngineConfigForm({
  category,
  engineType,
  value,
  onChange,
}: Props) {
  const schema = getAdminEngineFormSchema(category, engineType);

  if (!engineType || engineType === "generic-directory") {
    return (
      <div className="rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
        No structured config form is available for this engine yet.
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
        No structured config form is available for this engine yet.
      </div>
    );
  }

  function updateValue(key: string, next: unknown) {
    onChange({
      ...value,
      [key]: next,
    });
  }

  function renderField(field: AdminFormField) {
    const current = buildFieldValue(field, value);

    if (field.type === "checkbox") {
      return (
        <label
          key={field.key}
          className="flex items-center gap-3 rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text"
        >
          <input
            type="checkbox"
            checked={Boolean(current)}
            onChange={(e) => updateValue(field.key, e.target.checked)}
          />
          <span>{field.label}</span>
        </label>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key}>
          <label className={labelClass()}>{field.label}</label>
          <textarea
            value={String(current)}
            onChange={(e) => updateValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows ?? 5}
            className={inputClass()}
          />
          {field.description ? (
            <p className="mt-2 text-xs leading-5 text-q-muted">{field.description}</p>
          ) : null}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <div key={field.key}>
          <label className={labelClass()}>{field.label}</label>
          <select
            value={String(current)}
            onChange={(e) => {
              const raw = e.target.value;

              if (raw === "true") {
                updateValue(field.key, true);
                return;
              }

              if (raw === "false") {
                updateValue(field.key, false);
                return;
              }

              updateValue(field.key, raw);
            }}
            className={inputClass()}
          >
            <option value="">Select</option>
            {(field.options || []).map((option) => (
              <option key={`${field.key}-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.description ? (
            <p className="mt-2 text-xs leading-5 text-q-muted">{field.description}</p>
          ) : null}
        </div>
      );
    }

    if (field.type === "list") {
      return (
        <div key={field.key}>
          <label className={labelClass()}>{field.label}</label>
          <textarea
            value={String(current)}
            onChange={(e) =>
              updateValue(
                field.key,
                e.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean)
              )
            }
            placeholder={field.placeholder || "One value per line"}
            rows={6}
            className={inputClass()}
          />
          {field.description ? (
            <p className="mt-2 text-xs leading-5 text-q-muted">{field.description}</p>
          ) : null}
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className={labelClass()}>{field.label}</label>
        <input
          type={field.type}
          value={String(current)}
          onChange={(e) => {
            if (field.type === "number") {
              updateValue(field.key, e.target.value === "" ? "" : Number(e.target.value));
              return;
            }

            updateValue(field.key, e.target.value);
          }}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          className={inputClass()}
        />
        {field.description ? (
          <p className="mt-2 text-xs leading-5 text-q-muted">{field.description}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-5">
      <h3 className="text-lg font-semibold text-q-text">{schema.title}</h3>
      {schema.description ? (
        <p className="mt-2 text-sm leading-6 text-q-muted">{schema.description}</p>
      ) : null}

      {schema.fields.length === 0 ? (
        <div className="mt-4 rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
          This engine does not need additional config fields right now.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {schema.fields.map((field) => renderField(field))}
        </div>
      )}
    </div>
  );
}