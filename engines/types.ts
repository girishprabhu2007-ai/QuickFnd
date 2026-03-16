export type ToolEngineMetaItem = {
  label: string;
  value: string | number;
};

export type ToolEngineRunResult = {
  output?: string;
  error?: string;
  meta?: ToolEngineMetaItem[];
};

export type ToolEngineDefinition = {
  engineType: string;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  actionLabel: string;
  run: (input: string) => ToolEngineRunResult;
};

/*
  Backward compatibility for older engine experiments.
  This prevents old files like engines/password-strength.ts
  from breaking the build.
*/
export type ToolEngine = {
  name: string;
  description: string;
  run: (input: any) => any;
};