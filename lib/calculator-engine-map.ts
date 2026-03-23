import { resolveCalculatorRuntime } from "@/lib/calculator-runtime";

export function resolveCalculatorEngine(
  slug: string,
  name = "",
  description = ""
): string | null {
  const runtime = resolveCalculatorRuntime({
    slug,
    name,
    description,
  });

  return runtime.engine_type;
}

export function resolveCalculatorEngineConfig(
  slug: string,
  name = "",
  description = ""
): Record<string, unknown> {
  const runtime = resolveCalculatorRuntime({
    slug,
    name,
    description,
  });

  return runtime.engine_config || {};
}