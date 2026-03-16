import type { ToolEngineDefinition } from "@/engines/types";

function sanitizeEngineType(engineType: string) {
  const value = String(engineType || "").trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(value)) {
    return "";
  }

  return value;
}

export async function loadEngine(
  engineType: string
): Promise<ToolEngineDefinition | null> {
  const safeEngineType = sanitizeEngineType(engineType);

  if (!safeEngineType) {
    return null;
  }

  try {
    const module = await import(`../engines/${safeEngineType}`);
    return (module.default || null) as ToolEngineDefinition | null;
  } catch (error) {
    console.warn(`Engine not found for type: ${safeEngineType}`, error);
    return null;
  }
}

export async function hasEngine(engineType: string): Promise<boolean> {
  const engine = await loadEngine(engineType);
  return Boolean(engine);
}