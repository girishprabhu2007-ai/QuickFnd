export type ToolEngine = {
  name: string
  description: string

  run: (input: any) => any
}