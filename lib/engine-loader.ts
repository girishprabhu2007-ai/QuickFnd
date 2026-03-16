import { ToolEngine } from "@/engines/types"

export async function loadEngine(engineType: string): Promise<ToolEngine | null> {
  try {
    const engine = await import(`@/engines/${engineType}.ts`)
    return engine.default
  } catch (err) {
    console.error("Engine not found:", engineType)
    return null
  }
}