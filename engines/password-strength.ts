import type { ToolEngine } from "./types";

function calculate(password: string) {
  let score = 0;

  if (!password) {
    return { score: 0, label: "Empty" };
  }

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  let label = "Weak";

  if (score >= 4) label = "Strong";
  else if (score >= 2) label = "Medium";

  return { score, label };
}

const engine: ToolEngine = {
  name: "Password Strength Checker",
  description: "Check password security strength.",
  run(input: { password?: string } | string) {
    if (typeof input === "string") {
      return calculate(input);
    }

    const password = input?.password || "";
    return calculate(password);
  },
};

export default engine;