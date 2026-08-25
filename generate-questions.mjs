// Generates a new question-bank.json for Zamaan's Daily Adventure using the
// Anthropic API, then validates the result before writing it to disk.
//
// This script never publishes anything by itself — the GitHub Actions
// workflow that calls it (.github/workflows/rotate-questions.yml) opens a
// Pull Request with whatever this script writes, so a parent always reviews
// before it reaches the app.
//
// Requires the ANTHROPIC_API_KEY environment variable (set as a GitHub
// Actions secret — see README.md for setup steps).

import { readFile, writeFile } from "node:fs/promises";

// Update this if Anthropic ships a newer model you'd rather use.
// See https://docs.claude.com for current model names.
const MODEL = "claude-sonnet-5";
const MAX_TOKENS = 8000;
const PROMPT_PATH = new URL("../../question-generator-prompt.txt", import.meta.url);
const OUTPUT_PATH = new URL("../../question-bank.json", import.meta.url);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it as a repository secret " +
      "(Settings > Secrets and variables > Actions) — see README.md."
    );
  }

  const response = await fetch(process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText}\n${body}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === "text");
  if (!textBlock || !textBlock.text) {
    throw new Error("Anthropic API response did not include a text block.");
  }
  return textBlock.text;
}

function extractJson(rawText) {
  // The prompt asks for raw JSON, but strip markdown fences defensively in
  // case the model wraps it anyway.
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const jsonText = fenced ? fenced[1] : trimmed;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`Model response was not valid JSON: ${error.message}\n---\n${rawText.slice(0, 2000)}`);
  }
}

// Mirrors the exact conditions app.js's applyExternalQuestionBank() checks
// before it will use a curriculum day. Anything that fails this would be
// silently dropped by the app with no warning to anyone — so it's better to
// fail loudly here and never open a PR with it.
function isValidCurriculumDay(day) {
  return Boolean(
    day &&
    typeof day.name === "string" && day.name.trim() &&
    Array.isArray(day.brain) && day.brain.length > 0 &&
    Array.isArray(day.life) && day.life.length > 0 &&
    Array.isArray(day.talk) && day.talk.length > 0 &&
    day.mini && typeof day.mini === "object"
  );
}

function isValidDeckQuestion(question) {
  return Boolean(
    question &&
    typeof question.title === "string" && question.title.trim() &&
    typeof question.prompt === "string" && question.prompt.trim() &&
    typeof question.answer === "string" && question.answer.trim() &&
    Array.isArray(question.choices) && question.choices.length >= 2
  );
}

function validate(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    errors.push("Top-level response is not a JSON object.");
    return errors;
  }

  if (!Array.isArray(data.curriculum) || data.curriculum.length === 0) {
    errors.push("Missing or empty \"curriculum\" array.");
  } else {
    data.curriculum.forEach((day, index) => {
      if (!isValidCurriculumDay(day)) {
        errors.push(`curriculum[${index}] is missing a required field (name/brain/life/talk/mini).`);
      }
    });
  }

  for (const key of ["businessPracticeDecks", "pronounPracticeDecks"]) {
    if (data[key] !== undefined) {
      if (!Array.isArray(data[key])) {
        errors.push(`"${key}" is present but is not an array.`);
      } else {
        data[key].forEach((question, index) => {
          if (!isValidDeckQuestion(question)) {
            errors.push(`${key}[${index}] is missing a required field (title/prompt/answer/choices).`);
          }
        });
      }
    }
  }

  for (const key of ["languageDecks", "moneyMathDecks"]) {
    if (data[key] !== undefined && !Array.isArray(data[key])) {
      errors.push(`"${key}" is present but is not an array.`);
    }
  }

  // Loose sanity check: catch the model echoing the schema's own
  // placeholder text back instead of generating real content.
  const flatText = JSON.stringify(data);
  if (flatText.includes('"palabra"') && flatText.includes('"Card 1"')) {
    errors.push("Response looks like the unfilled schema template, not generated content.");
  }

  return errors;
}

async function main() {
  const promptTemplate = await readFile(PROMPT_PATH, "utf8");
  const prompt = `${promptTemplate}\n\nToday's date is ${todayIso()}. Use this exact date as the "version" value.`;

  console.log(`Requesting a new question set from ${MODEL}...`);
  const rawText = await callAnthropic(prompt);
  const data = extractJson(rawText);

  const errors = validate(data);
  if (errors.length > 0) {
    console.error("Generated question set failed validation:");
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  // Keep the version field accurate regardless of what the model returned.
  data.version = todayIso();

  const formatted = `${JSON.stringify(data, null, 2)}\n`;
  await writeFile(OUTPUT_PATH, formatted, "utf8");

  const dayCount = data.curriculum.length;
  console.log(`Wrote question-bank.json: ${dayCount} curriculum day${dayCount === 1 ? "" : "s"}.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
