export type EngineUIFieldType =
  | "text"
  | "textarea"
  | "number"
  | "range"
  | "checkbox"
  | "select"
  | "datetime-local";

export type EngineUIFieldOption = {
  label: string;
  value: string;
};

export type EngineUIField = {
  key: string;
  type: EngineUIFieldType;
  label: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  options?: EngineUIFieldOption[];
};

export type EngineUIAction = {
  label: string;
  copyLabel?: string;
};

export type EngineUISchema = {
  fields: EngineUIField[];
  action: EngineUIAction;
  outputPlaceholder?: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function selectField(
  key: string,
  label: string,
  options: EngineUIFieldOption[],
  placeholder?: string
): EngineUIField {
  return {
    key,
    type: "select",
    label,
    options,
    placeholder,
  };
}

export function getEngineUISchema(
  family: string,
  config: Record<string, unknown>
): EngineUISchema | null {
  if (family === "string-generator") {
    const mode = String(config.mode || "random-string").trim().toLowerCase();
    const minLength = Number(config.minLength ?? 4);
    const maxLength = Number(config.maxLength ?? 128);
    const defaultLength = Number(config.defaultLength ?? (mode === "password" ? 16 : 24));

    if (mode === "uuid") {
      return {
        fields: [],
        action: {
          label: "Generate UUID",
          copyLabel: "Copy UUID",
        },
        outputPlaceholder: "Generated UUID will appear here",
      };
    }

    return {
      fields: [
        {
          key: "length",
          type: "range",
          label: "Length",
          min: minLength,
          max: maxLength,
          step: 1,
        },
        {
          key: "useUppercase",
          type: "checkbox",
          label: "Uppercase letters (A-Z)",
        },
        {
          key: "useLowercase",
          type: "checkbox",
          label: "Lowercase letters (a-z)",
        },
        {
          key: "useNumbers",
          type: "checkbox",
          label: "Numbers (0-9)",
        },
        {
          key: "useSymbols",
          type: "checkbox",
          label: "Symbols (!@#$...)",
        },
      ],
      action: {
        label: mode === "password" ? "Generate Password" : "Generate String",
        copyLabel: mode === "password" ? "Copy Password" : "Copy String",
      },
      outputPlaceholder:
        mode === "password"
          ? `Password (${defaultLength} characters by default) will appear here`
          : "Generated output will appear here",
    };
  }

  if (family === "codec") {
    const mode = String(config.mode || "base64-encode").trim().toLowerCase();

    let label = "Input";
    let placeholder = "Enter text here";
    let actionLabel = "Run";
    let outputPlaceholder = "Output";

    if (mode === "base64-encode") {
      label = "Text to encode";
      placeholder = "Enter text to convert into Base64";
      actionLabel = "Encode to Base64";
      outputPlaceholder = "Base64 output";
    } else if (mode === "base64-decode") {
      label = "Base64 to decode";
      placeholder = "Paste Base64 text here";
      actionLabel = "Decode Base64";
      outputPlaceholder = "Decoded text";
    } else if (mode === "url-encode") {
      label = "Text to encode";
      placeholder = "Enter text to make URL-safe";
      actionLabel = "URL Encode";
      outputPlaceholder = "URL-encoded output";
    } else if (mode === "url-decode") {
      label = "Encoded URL text";
      placeholder = "Paste URL-encoded text here";
      actionLabel = "URL Decode";
      outputPlaceholder = "Decoded URL text";
    }

    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label,
          placeholder,
          rows: 7,
        },
      ],
      action: {
        label: actionLabel,
        copyLabel: "Copy Output",
      },
      outputPlaceholder,
    };
  }

  if (family === "number-generator") {
    const allowDecimal = Boolean(config.allowDecimal ?? false);

    return {
      fields: [
        {
          key: "min",
          type: "number",
          label: "Minimum",
          placeholder: "Minimum value",
          step: allowDecimal ? Number(config.step ?? 0.01) : 1,
        },
        {
          key: "max",
          type: "number",
          label: "Maximum",
          placeholder: "Maximum value",
          step: allowDecimal ? Number(config.step ?? 0.01) : 1,
        },
      ],
      action: {
        label: "Generate Number",
        copyLabel: "Copy Number",
      },
      outputPlaceholder: "Generated number",
    };
  }

  if (family === "unit-converter") {
    const fromUnit = String(config.fromUnit || "meters");
    const toUnit = String(config.toUnit || "feet");

    return {
      fields: [
        {
          key: "input",
          type: "number",
          label: `Value in ${fromUnit}`,
          placeholder: `Enter value in ${fromUnit}`,
          step: Number(config.step ?? 0.01),
        },
      ],
      action: {
        label: `Convert to ${toUnit}`,
        copyLabel: "Copy Result",
      },
      outputPlaceholder: `Converted value in ${toUnit}`,
    };
  }

  if (family === "color-tools") {
    const mode = String(config.mode || "hex-to-rgb").trim().toLowerCase();

    return {
      fields: [
        {
          key: "input",
          type: "text",
          label: mode === "hex-to-rgb" ? "HEX color" : "RGB color",
          placeholder: mode === "hex-to-rgb" ? "#FF5733" : "255, 87, 51",
        },
      ],
      action: {
        label: mode === "hex-to-rgb" ? "Convert to RGB" : "Convert to HEX",
        copyLabel: "Copy Output",
      },
      outputPlaceholder:
        mode === "hex-to-rgb" ? "rgb(255, 87, 51)" : "#FF5733",
    };
  }

  if (family === "developer-converters") {
    const mode = String(config.mode || "text-to-binary").trim().toLowerCase();

    let label = "Input";
    let placeholder = "Enter value here";
    let actionLabel = "Convert";
    let outputPlaceholder = "Converted output";

    if (mode === "text-to-binary") {
      label = "Text";
      placeholder = "Enter text to convert into binary";
      actionLabel = "Convert to Binary";
      outputPlaceholder = "Binary output";
    } else if (mode === "binary-to-text") {
      label = "Binary";
      placeholder = "Paste binary values separated by spaces";
      actionLabel = "Convert to Text";
      outputPlaceholder = "Text output";
    } else if (mode === "json-escape") {
      label = "Text";
      placeholder = "Enter text to JSON-escape";
      actionLabel = "Escape JSON";
      outputPlaceholder = "Escaped JSON string";
    } else if (mode === "json-unescape") {
      label = "Escaped JSON string";
      placeholder = "Paste escaped JSON string here";
      actionLabel = "Unescape JSON";
      outputPlaceholder = "Unescaped text";
    }

    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label,
          placeholder,
          rows: 8,
        },
      ],
      action: {
        label: actionLabel,
        copyLabel: "Copy Output",
      },
      outputPlaceholder,
    };
  }

  if (family === "text-analyzer") {
    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: "Text",
          placeholder: "Paste or type text to analyze",
          rows: 8,
        },
      ],
      action: {
        label: "Analyze Text",
        copyLabel: "Copy Output",
      },
      outputPlaceholder: "Analysis will appear here",
    };
  }

  if (family === "text-formatter") {
    const mode = String(config.mode || "json").trim().toLowerCase();

    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: mode === "json" ? "JSON input" : "Text input",
          placeholder:
            mode === "json"
              ? 'Paste JSON here, for example: {"name":"QuickFnd"}'
              : "Paste text or code here",
          rows: 8,
        },
      ],
      action: {
        label: "Format",
        copyLabel: "Copy Output",
      },
      outputPlaceholder:
        mode === "json" ? "Formatted JSON output" : "Formatted output",
    };
  }

  if (family === "strength-checker") {
    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: "Password",
          placeholder: "Type or paste password to evaluate",
          rows: 4,
        },
      ],
      action: {
        label: "Check Strength",
        copyLabel: "Copy Output",
      },
      outputPlaceholder: "Strength analysis will appear here",
    };
  }

  if (family === "regex-tools") {
    const mode = String(config.mode || "test").trim().toLowerCase();

    return {
      fields: [
        {
          key: "pattern",
          type: "text",
          label: "Regex pattern",
          placeholder: "\\b\\w+@\\w+\\.\\w+\\b",
        },
        {
          key: "flags",
          type: "text",
          label: "Flags",
          placeholder: String(config.flags || "g"),
        },
        {
          key: "input",
          type: "textarea",
          label: "Text",
          placeholder: "Paste text to test against the pattern",
          rows: 8,
        },
      ],
      action: {
        label: mode === "extract" ? "Extract Matches" : "Test Regex",
        copyLabel: "Copy Matches",
      },
      outputPlaceholder:
        mode === "extract"
          ? "Extracted matches will appear here"
          : "Regex result will appear here",
    };
  }

  if (family === "hash-tools") {
    const mode = String(config.mode || "sha256").trim().toLowerCase();

    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: "Text",
          placeholder: `Enter text to hash with ${mode.toUpperCase()}`,
          rows: 6,
        },
      ],
      action: {
        label: "Generate Hash",
        copyLabel: "Copy Hash",
      },
      outputPlaceholder: `${mode.toUpperCase()} hash output`,
    };
  }

  if (family === "timestamp-tools") {
    return {
      fields: [
        {
          key: "unixInput",
          type: "number",
          label: "Unix timestamp",
          placeholder: "Enter Unix timestamp",
        },
        {
          key: "dateInput",
          type: "datetime-local",
          label: "Date/time",
        },
      ],
      action: {
        label: "Convert Timestamp",
        copyLabel: "Copy Output",
      },
      outputPlaceholder: "Converted timestamp output",
    };
  }

  if (family === "snippet-manager") {
    return {
      fields: [
        {
          key: "title",
          type: "text",
          label: "Snippet title",
          placeholder: "Snippet title",
        },
        {
          key: "code",
          type: "textarea",
          label: "Snippet code",
          placeholder: "Paste snippet code",
          rows: 8,
        },
      ],
      action: {
        label: "Save Snippet",
        copyLabel: "Copy",
      },
      outputPlaceholder: "Saved snippet preview",
    };
  }

  return null;
}