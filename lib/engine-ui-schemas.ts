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

export function getEngineUISchema(
  family: string,
  config: Record<string, unknown>
): EngineUISchema | null {
  if (family === "string-generator") {
    const mode = String(config.mode || "random-string");

    if (mode === "uuid") {
      return {
        fields: [],
        action: {
          label: "Generate UUID",
          copyLabel: "Copy",
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
          min: Number(config.minLength ?? 4),
          max: Number(config.maxLength ?? 128),
          step: 1,
        },
        {
          key: "useUppercase",
          type: "checkbox",
          label: "Uppercase",
        },
        {
          key: "useLowercase",
          type: "checkbox",
          label: "Lowercase",
        },
        {
          key: "useNumbers",
          type: "checkbox",
          label: "Numbers",
        },
        {
          key: "useSymbols",
          type: "checkbox",
          label: "Symbols",
        },
      ],
      action: {
        label: mode === "password" ? "Generate Password" : "Generate String",
        copyLabel: "Copy",
      },
      outputPlaceholder: "Generated output will appear here",
    };
  }

  if (family === "codec") {
    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: "Input",
          placeholder: "Enter text here",
          rows: 7,
        },
      ],
      action: {
        label: "Run",
        copyLabel: "Copy",
      },
      outputPlaceholder: "Output",
    };
  }

  if (family === "number-generator") {
    return {
      fields: [
        {
          key: "min",
          type: "number",
          label: "Minimum",
          placeholder: "Minimum value",
        },
        {
          key: "max",
          type: "number",
          label: "Maximum",
          placeholder: "Maximum value",
        },
      ],
      action: {
        label: "Generate Number",
        copyLabel: "Copy",
      },
      outputPlaceholder: "Generated number",
    };
  }

  if (family === "unit-converter") {
    return {
      fields: [
        {
          key: "input",
          type: "number",
          label: "Value",
          placeholder: `Enter value in ${String(config.fromUnit || "meters")}`,
        },
      ],
      action: {
        label: "Convert",
        copyLabel: "Copy",
      },
      outputPlaceholder: "Converted output",
    };
  }

  if (family === "color-tools") {
    const mode = String(config.mode || "hex-to-rgb");

    return {
      fields: [
        {
          key: "input",
          type: "text",
          label: "Color Value",
          placeholder: mode === "hex-to-rgb" ? "#FF5733" : "255, 87, 51",
        },
      ],
      action: {
        label: "Convert Color",
        copyLabel: "Copy Output",
      },
      outputPlaceholder: "Converted color output",
    };
  }

  if (family === "developer-converters") {
    return {
      fields: [
        {
          key: "input",
          type: "textarea",
          label: "Input",
          placeholder: "Enter value here",
          rows: 8,
        },
      ],
      action: {
        label: "Convert",
        copyLabel: "Copy Output",
      },
      outputPlaceholder: "Converted output",
    };
  }

  return null;
}