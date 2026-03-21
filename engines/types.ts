export type ToolEngineResultMetaItem = {
  label: string;
  value: string | number;
};

export type ToolEngineResult = {
  output?: string;
  error?: string;
  meta?: ToolEngineResultMetaItem[];
  score?: number;
  label?: string;
  colorClass?: string;
  feedback?: string[];
  percentage?: number;
  [key: string]: unknown;
};

export type ToolEngineRunResult = ToolEngineResult;

export type ToolEngineRunContext = {
  input?: string;
  password?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
};

export type ToolEngine = {
  engineType?: string;
  type?: string;
  name?: string;
  title?: string;
  description: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  outputLabel?: string;
  actionLabel?: string;
  run(input: string | ToolEngineRunContext): ToolEngineResult;
};

export type ToolEngineDefinition = ToolEngine;