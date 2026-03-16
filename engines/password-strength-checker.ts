import type { ToolEngineDefinition } from "./types";

function getPasswordScore(password: string) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

function getStrengthLabel(score: number) {
  if (score >= 6) return "Very Strong";
  if (score >= 5) return "Strong";
  if (score >= 3) return "Medium";
  if (score >= 1) return "Weak";
  return "Very Weak";
}

const engine: ToolEngineDefinition = {
  engineType: "password-strength-checker",
  title: "Password Strength Checker",
  description: "Check the strength of a password using a reusable engine plugin.",
  inputLabel: "Password",
  inputPlaceholder: "Type or paste a password here",
  outputLabel: "Strength result",
  actionLabel: "Check Strength",
  run(input: string) {
    const password = String(input || "");

    if (!password.trim()) {
      return {
        error: "Please enter a password first.",
      };
    }

    const score = getPasswordScore(password);
    const label = getStrengthLabel(score);

    return {
      output: label,
      meta: [
        { label: "Score", value: `${score}/6` },
        { label: "Length", value: password.length },
        { label: "Uppercase", value: /[A-Z]/.test(password) ? "Yes" : "No" },
        { label: "Lowercase", value: /[a-z]/.test(password) ? "Yes" : "No" },
        { label: "Number", value: /\d/.test(password) ? "Yes" : "No" },
        { label: "Symbol", value: /[^A-Za-z0-9]/.test(password) ? "Yes" : "No" },
      ],
    };
  },
};

export default engine;