// Validates a question bank against what Zamaan's app can actually play.
// Used by generate-questions.mjs (so a bad AI draft never becomes a PR) and
// runnable by hand:  node scripts/validate-question-bank.mjs question-bank.json
//
// These rules mirror how app.js renders each game. Anything the app would
// silently drop, mis-render, or make unwinnable is reported as an error.

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const PATTERN_COLORS = ["blue", "red", "green", "gold"];
const isText = (value) => typeof value === "string" && value.trim().length > 0;
const lower = (value) => String(value).trim().toLowerCase();

function checkChoices(label, answer, choices, errors, { min = 3, max = 4 } = {}) {
  if (!Array.isArray(choices) || choices.length < min || choices.length > max) {
    errors.push(`${label}: needs ${min}-${max} choices.`);
    return;
  }
  if (!choices.every(isText)) errors.push(`${label}: every choice must be non-empty text.`);
  if (new Set(choices.map(lower)).size !== choices.length) errors.push(`${label}: choices must all be different.`);
  if (choices.filter((choice) => choice === answer).length !== 1) {
    errors.push(`${label}: the answer "${answer}" must appear exactly once in choices.`);
  }
}

function checkQuestion(label, question, errors) {
  if (!question || !isText(question.title) || !isText(question.prompt) || !isText(question.answer)) {
    errors.push(`${label}: needs title, prompt and answer.`);
    return;
  }
  checkChoices(label, question.answer, question.choices, errors);
}

function checkBrain(label, game, errors) {
  if (!game || !isText(game.title) || !isText(game.prompt) || !Array.isArray(game.cards)) {
    errors.push(`${label}: needs title, prompt and cards.`);
    return;
  }
  const cards = game.cards;
  if (cards.length !== 4) errors.push(`${label}: needs exactly 4 cards (two pairs).`);
  if (!cards.every((card) => card && isText(card.text) && isText(card.pair))) {
    errors.push(`${label}: every card needs text and a pair id.`);
    return;
  }
  const counts = {};
  cards.forEach((card) => { counts[card.pair] = (counts[card.pair] || 0) + 1; });
  if (Object.keys(counts).length !== 2 || Object.values(counts).some((count) => count !== 2)) {
    errors.push(`${label}: cards must form exactly two pairs (two cards share each pair id).`);
  }
  if (new Set(cards.map((card) => lower(card.text))).size !== cards.length) {
    errors.push(`${label}: card text must be unique so every card is distinguishable.`);
  }
}

function checkLife(label, game, errors) {
  if (!game || !isText(game.title) || !isText(game.prompt) || !Array.isArray(game.steps)) {
    errors.push(`${label}: needs title, prompt and steps.`);
    return;
  }
  if (game.steps.length !== 3 || !game.steps.every(isText)) errors.push(`${label}: needs exactly 3 steps.`);
  else if (new Set(game.steps.map(lower)).size !== 3) errors.push(`${label}: the 3 steps must be different.`);
}

function checkMini(label, mini, errors) {
  const sort = mini && mini.sort;
  if (!sort || !isText(sort.title) || !isText(sort.prompt) || !isText(sort.instruction) || !isText(sort.success)
      || !Array.isArray(sort.correct) || !Array.isArray(sort.wrong)) {
    errors.push(`${label}.sort: needs title, prompt, instruction, success, correct[] and wrong[].`);
  } else {
    if (sort.correct.length !== 2 || sort.wrong.length !== 2) errors.push(`${label}.sort: needs 2 correct and 2 wrong items.`);
    const all = [...sort.correct, ...sort.wrong];
    if (!all.every(isText) || new Set(all.map(lower)).size !== all.length) {
      errors.push(`${label}.sort: all four items must be different text.`);
    }
  }

  const pattern = mini && mini.pattern;
  if (!pattern || !isText(pattern.title) || !Array.isArray(pattern.sequence) || !isText(pattern.answer)) {
    errors.push(`${label}.pattern: needs title, sequence[] and answer.`);
  } else {
    if (pattern.sequence.length < 4 || !pattern.sequence.every(isText)) errors.push(`${label}.pattern: sequence needs at least 4 items.`);
    if (pattern.answer !== lower(pattern.answer)) errors.push(`${label}.pattern: answer must be lowercase.`);
    if (!Array.isArray(pattern.choices) || !pattern.choices.some((choice) => lower(choice) === pattern.answer)) {
      errors.push(`${label}.pattern: answer must match one of the choices (ignoring capitals).`);
    } else if (new Set(pattern.choices.map(lower)).size !== pattern.choices.length) {
      errors.push(`${label}.pattern: choices must all be different.`);
    }
    // The answer should be the item that repeats the pattern, i.e. the item 2 steps back.
    const seq = pattern.sequence.map(lower);
    if (seq.length >= 4 && seq[seq.length - 2] !== pattern.answer) {
      errors.push(`${label}.pattern: answer "${pattern.answer}" does not continue the repeating sequence.`);
    }
    if (seq.every((item) => PATTERN_COLORS.includes(item)) === false && seq.some((item) => item.length > 12)) {
      errors.push(`${label}.pattern: word patterns should use short words (12 letters or fewer).`);
    }
  }

  checkQuestion(`${label}.money`, mini && mini.money, errors);
}

export function validate(data) {
  const errors = [];
  if (!data || typeof data !== "object" || Array.isArray(data)) return ["Top level must be a JSON object."];

  if (!Array.isArray(data.curriculum) || data.curriculum.length === 0) {
    errors.push('Missing or empty "curriculum".');
  } else {
    data.curriculum.forEach((day, i) => {
      const label = `curriculum[${i}]${day && day.name ? ` (${day.name})` : ""}`;
      if (!day || !isText(day.name)) { errors.push(`${label}: needs a name.`); return; }
      if (!Array.isArray(day.brain) || day.brain.length !== 3) errors.push(`${label}: needs exactly 3 brain games.`);
      else day.brain.forEach((game, g) => checkBrain(`${label}.brain[${g}]`, game, errors));
      if (!Array.isArray(day.life) || day.life.length !== 3) errors.push(`${label}: needs exactly 3 life skills.`);
      else day.life.forEach((game, g) => checkLife(`${label}.life[${g}]`, game, errors));
      if (!Array.isArray(day.talk) || day.talk.length !== 3 || !day.talk.every(isText)) {
        errors.push(`${label}: needs exactly 3 talk prompts.`);
      }
      checkMini(`${label}.mini`, day.mini, errors);
    });
  }

  if (!Array.isArray(data.languageDecks) || data.languageDecks.length === 0) {
    errors.push('Missing or empty "languageDecks".');
  } else {
    data.languageDecks.forEach((deck, d) => {
      if (!Array.isArray(deck) || deck.length !== 3) { errors.push(`languageDecks[${d}]: needs exactly 3 cards.`); return; }
      deck.forEach((card, c) => {
        const label = `languageDecks[${d}][${c}]`;
        if (!card || !isText(card.english) || !isText(card.spanish)) { errors.push(`${label}: needs english and spanish.`); return; }
        checkChoices(label, card.spanish, card.choices, errors);
      });
    });
  }

  if (!Array.isArray(data.moneyMathDecks) || data.moneyMathDecks.length === 0) {
    errors.push('Missing or empty "moneyMathDecks".');
  } else {
    data.moneyMathDecks.forEach((deck, d) => {
      if (!Array.isArray(deck) || deck.length !== 3) { errors.push(`moneyMathDecks[${d}]: needs exactly 3 questions.`); return; }
      deck.forEach((q, i) => checkQuestion(`moneyMathDecks[${d}][${i}]`, q, errors));
    });
  }

  for (const key of ["businessPracticeDecks", "pronounPracticeDecks"]) {
    if (!Array.isArray(data[key]) || data[key].length === 0) errors.push(`Missing or empty "${key}".`);
    else data[key].forEach((q, i) => checkQuestion(`${key}[${i}]`, q, errors));
  }

  // The unfilled schema template must never ship.
  const flat = JSON.stringify(data);
  if (flat.includes('"palabra"') || flat.includes('"Card 1"') || flat.includes('"Correct answer"')) {
    errors.push("Content still contains placeholder text from the prompt template.");
  }
  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2] || "question-bank.json";
  const data = JSON.parse(await readFile(file, "utf8"));
  const errors = validate(data);
  if (errors.length) {
    console.error(`${file}: ${errors.length} problem(s)`);
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }
  const days = data.curriculum.length;
  console.log(`${file}: OK (${days} day${days === 1 ? "" : "s"}, ${data.languageDecks.length} Spanish decks, ${data.moneyMathDecks.length} money decks, ${data.businessPracticeDecks.length} business, ${data.pronounPracticeDecks.length} family-word questions)`);
}
