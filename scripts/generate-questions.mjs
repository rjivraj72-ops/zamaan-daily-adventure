// Generates a new question-bank.json for Zamaan's Daily Adventure with the
// Anthropic API, checks it against what the app can really play, and writes it.
//
// It never publishes anything itself: the GitHub Actions workflow that runs
// this opens a Pull Request, so a parent reviews before it reaches the app.
//
// Needs the ANTHROPIC_API_KEY environment variable (a GitHub Actions secret).

import { readFile, writeFile } from "node:fs/promises";
import { validate } from "./validate-question-bank.mjs";

// Valid API model IDs: claude-sonnet-5-5, claude-opus-5-5, claude-haiku-5-5.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
// A full set is ~13-15k tokens, so leave generous headroom (kept below the size where the API wants streaming).
const MAX_TOKENS = 20000;
const PROMPT_PATH = new URL("../question-generator-prompt.txt", import.meta.url);
const BANK_PATH = new URL("../question-bank.json", import.meta.url);
const API_URL = process.env.ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages";

const todayIso = () => new Date().toISOString().slice(0, 10);

async function callAnthropic(messages) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Add it as a repository secret (Settings > Secrets and variables > Actions).");
  }
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, messages })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Anthropic API request failed: ${response.status} ${response.statusText}\n${body}`);
  }
  const data = await response.json();
  const block = (data.content || []).find((item) => item.type === "text");
  if (!block || !block.text) throw new Error("Anthropic API response did not include text.");
  if (data.stop_reason === "max_tokens") throw new Error("The response was cut off (max_tokens reached); the JSON would be incomplete.");
  return block.text;
}

function extractJson(rawText) {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

// Words and examples from the current set, so the model can avoid repeating them.
function summarizePrevious(bank) {
  try {
    const spanish = (bank.languageDecks || []).flat().map((card) => card.spanish);
    const days = (bank.curriculum || []).map((day) => day.name);
    const prompts = [
      ...(bank.businessPracticeDecks || []).map((q) => q.prompt),
      ...(bank.pronounPracticeDecks || []).map((q) => q.prompt),
      ...(bank.curriculum || []).flatMap((day) => day.talk || [])
    ];
    return `\n\nThe CURRENT set is below. Do not reuse its day names, Spanish words, talk prompts, or question wording; write genuinely new situations.\nCurrent day names: ${JSON.stringify(days)}\nSpanish words already used: ${JSON.stringify(spanish)}\nPrompts already used: ${JSON.stringify(prompts)}`;
  } catch {
    return "";
  }
}

const RULES = `

Extra rules the app enforces (a set that breaks them is rejected):
- Write 6 to 8 curriculum days.
- Every "Find the pair" game has exactly 4 cards with all-different text, forming exactly two pairs.
- Every life skill has exactly 3 different steps in the correct order.
- Every curriculum day has exactly 3 brain games, 3 life skills and 3 talk prompts.
- Every Spanish deck has exactly 3 cards and every money deck exactly 3 questions.
- Each "choices" list has 3 different options and contains the answer exactly once. Vary which position the answer is in.
- Spanish words use plain letters only (no accents), for example "manana", "adios".
- In "pattern", the sequence uses the colors blue, red, green or gold, OR short words; "answer" is lowercase and continues the repeating pattern.
- Include at least 6 languageDecks, 6 moneyMathDecks, 8 businessPracticeDecks and 8 pronounPracticeDecks.
- Money math must be correct arithmetic with whole dollars.
- Return MINIFIED JSON: one line, no indentation, no line breaks or extra spaces between items. The script pretty-prints it afterwards. Keep wording short and simple.`;

async function main() {
  const template = await readFile(PROMPT_PATH, "utf8");
  let previous = {};
  try { previous = JSON.parse(await readFile(BANK_PATH, "utf8")); } catch { /* first run */ }

  const prompt = `${template}${RULES}${summarizePrevious(previous)}\n\nToday's date is ${todayIso()}. Use it as the "version".`;
  const messages = [{ role: "user", content: prompt }];

  let data = null;
  let errors = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    console.log(`Requesting a new question set from ${MODEL} (attempt ${attempt})...`);
    const rawText = await callAnthropic(messages);
    try {
      data = extractJson(rawText);
      errors = validate(data);
    } catch (error) {
      data = null;
      errors = [`The response was not valid JSON: ${error.message}`];
    }
    if (errors.length === 0) break;

    console.error(`Attempt ${attempt} failed validation:`);
    errors.slice(0, 20).forEach((error) => console.error(`  - ${error}`));
    messages.push({ role: "assistant", content: rawText });
    messages.push({ role: "user", content: `That set has problems:\n${errors.slice(0, 20).map((e) => `- ${e}`).join("\n")}\n\nReturn the complete corrected JSON only, with no markdown.` });
  }

  if (!data || errors.length > 0) {
    console.error("Giving up: no question-bank.json was written.");
    process.exit(1);
  }

  data.version = todayIso();
  await writeFile(BANK_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Wrote question-bank.json: ${data.curriculum.length} days, ${data.languageDecks.length} Spanish decks.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
