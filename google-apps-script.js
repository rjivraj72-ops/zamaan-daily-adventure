const FAMILY_CODE = "CHANGE_THIS_TO_A_PRIVATE_CODE";
const LOG_SHEET_NAME = "Daily Adventure Log";
const DASHBOARD_SHEET_NAME = "Dashboard";
const DAILY_SHEET_NAME = "Daily Summary";
const SECTION_SHEET_NAME = "Section Summary";
const TALK_SHEET_NAME = "Recent Talk Time";
const ATTEMPTS_SHEET_NAME = "Learning Attempts";
const GEMINI_PROMPT_SHEET_NAME = "Gemini Prompt";
const EXPECTED_DAILY_ROUNDS = 12;

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");

  if (payload.familyCode !== FAMILY_CODE) {
    return ContentService.createTextOutput("Not allowed");
  }

  const sheet = getLogSheet_();
  sheet.appendRow([
    new Date(),
    payload.date || "",
    payload.childName || "",
    payload.mood || "",
    payload.curriculumDay || "",
    payload.plan || "",
    payload.section || "",
    payload.round || "",
    payload.title || "",
    payload.prompt || "",
    payload.answer || "",
    payload.completedAt || ""
  ]);

  refreshAnalysisSheets_();
  return ContentService.createTextOutput("OK");
}

function doGet(e) {
  const params = e?.parameter || {};

  if (params.mode === "parentView") {
    if (params.familyCode !== FAMILY_CODE) {
      return createJsonResponse_({ ok: false, error: "Not allowed" });
    }

    const logSheet = getLogSheet_();
    const rows = getLogRows_(logSheet);
    const analysis = buildAnalysis_(rows);
    return createJsonResponse_(buildParentView_(analysis));
  }

  refreshAnalysisSheets_();
  return ContentService.createTextOutput("Daily Adventure dashboard refreshed.");
}

function getLogSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(LOG_SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(LOG_SHEET_NAME);
  }

  const headers = [
    "Timestamp",
    "Date",
    "Child Name",
    "Mood",
    "Curriculum Day",
    "Plan",
    "Section",
    "Round",
    "Title",
    "Prompt",
    "Answer",
    "Device Completed At"
  ];

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
    headers.forEach((header, index) => {
      if (currentHeaders[index] !== header) {
        sheet.getRange(1, index + 1).setValue(header);
      }
    });
  }

  formatHeader_(sheet, headers.length);
  return sheet;
}

function refreshAnalysisSheets_() {
  const spreadsheet = SpreadsheetApp.getActive();
  const logSheet = getLogSheet_();
  const rows = getLogRows_(logSheet);
  const analysis = buildAnalysis_(rows);

  writeDashboard_(getOrCreateSheet_(spreadsheet, DASHBOARD_SHEET_NAME), analysis);
  writeDailySummary_(getOrCreateSheet_(spreadsheet, DAILY_SHEET_NAME), analysis.dailyRows);
  writeSectionSummary_(getOrCreateSheet_(spreadsheet, SECTION_SHEET_NAME), analysis.sectionRows);
  writeRecentTalk_(getOrCreateSheet_(spreadsheet, TALK_SHEET_NAME), analysis.talkRows);
  writeLearningAttempts_(getOrCreateSheet_(spreadsheet, ATTEMPTS_SHEET_NAME), analysis.attemptRows);
  writeGeminiPrompt_(getOrCreateSheet_(spreadsheet, GEMINI_PROMPT_SHEET_NAME), analysis);
}

function getLogRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const values = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  return values
    .filter((row) => row[1])
    .map((row) => ({
      timestamp: row[0],
      date: normalizeDateKey_(row[1]),
      childName: row[2] || "",
      mood: row[3] || "",
      curriculumDay: row[4] || "",
      plan: row[5] || "",
      section: row[6] || "",
      round: row[7] || "",
      title: row[8] || "",
      prompt: row[9] || "",
      answer: row[10] || "",
      deviceCompletedAt: row[11] || ""
    }));
}

function buildAnalysis_(rows) {
  const completionRows = rows.filter((row) => row.section !== "Sync Test" && row.section !== "Learning Game Attempt");
  const learningAttemptRows = rows.filter((row) => row.section === "Learning Game Attempt");

  const dailyMap = {};
  const sectionMap = {};
  const talkRows = [];
  const attemptMap = {};
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  completionRows.forEach((row) => {
    if (!dailyMap[row.date]) {
      dailyMap[row.date] = {
        date: row.date,
        childName: row.childName,
        mood: row.mood,
        plan: row.plan,
        curriculumDay: row.curriculumDay,
        rounds: 0,
        sections: {},
        firstTimestamp: row.timestamp,
        lastTimestamp: row.timestamp
      };
    }

    const day = dailyMap[row.date];
    day.rounds += 1;
    day.mood = row.mood || day.mood;
    day.plan = row.plan || day.plan;
    day.curriculumDay = row.curriculumDay || day.curriculumDay;
    day.sections[row.section] = (day.sections[row.section] || 0) + 1;
    day.lastTimestamp = row.timestamp || day.lastTimestamp;

    if (!sectionMap[row.section]) {
      sectionMap[row.section] = {
        section: row.section,
        rounds: 0,
        days: {},
        lastCompleted: row.timestamp
      };
    }

    sectionMap[row.section].rounds += 1;
    sectionMap[row.section].days[row.date] = true;
    sectionMap[row.section].lastCompleted = row.timestamp || sectionMap[row.section].lastCompleted;

    if (row.section === "Talk Time") {
      talkRows.push([
        row.timestamp,
        row.date,
        row.childName,
        row.prompt,
        row.answer,
        getTalkResponseType_(row.answer),
        String(row.answer || "").length
      ]);
    }
  });

  learningAttemptRows.forEach((row) => {
    const isCorrect = String(row.answer || "").indexOf("Result: Correct") !== -1;
    const key = row.title || "Learning Game";

    if (!attemptMap[key]) {
      attemptMap[key] = {
        title: key,
        attempts: 0,
        correct: 0,
        lastPrompt: row.prompt,
        lastAnswer: row.answer,
        lastAttempt: row.timestamp
      };
    }

    attemptMap[key].attempts += 1;
    attemptMap[key].correct += isCorrect ? 1 : 0;
    attemptMap[key].lastPrompt = row.prompt || attemptMap[key].lastPrompt;
    attemptMap[key].lastAnswer = row.answer || attemptMap[key].lastAnswer;
    attemptMap[key].lastAttempt = row.timestamp || attemptMap[key].lastAttempt;
  });

  const dailyRows = Object.keys(dailyMap).sort().map((date) => {
    const day = dailyMap[date];
    return [
      date,
      day.childName,
      day.mood,
      day.plan,
      day.curriculumDay,
      day.rounds,
      `${Math.round((day.rounds / EXPECTED_DAILY_ROUNDS) * 100)}%`,
      day.rounds >= EXPECTED_DAILY_ROUNDS ? "Complete" : "Started",
      day.sections["Memory Game"] || 0,
      day.sections["Life Skill"] || 0,
      day.sections["Spanish Cards"] || 0,
      day.sections["Talk Time"] || 0,
      day.sections["Money Math"] || 0,
      day.lastTimestamp
    ];
  });

  const sectionRows = Object.keys(sectionMap).sort().map((section) => {
    const item = sectionMap[section];
    return [
      section,
      item.rounds,
      Object.keys(item.days).length,
      item.lastCompleted
    ];
  });

  const attemptRows = Object.keys(attemptMap).sort().map((key) => {
    const item = attemptMap[key];
    return [
      item.title,
      item.attempts,
      item.correct,
      `${Math.round((item.correct / item.attempts) * 100)}%`,
      item.lastPrompt,
      item.lastAnswer,
      item.lastAttempt
    ];
  });

  const totalRounds = completionRows.length;
  const daysUsed = dailyRows.length;
  const completedDays = dailyRows.filter((row) => row[7] === "Complete").length;
  const lastSevenRounds = completionRows.filter((row) => {
    const date = parseDateKey_(row.date);
    return date && date >= sevenDaysAgo;
  }).length;
  const totalAttempts = learningAttemptRows.length;
  const correctAttempts = learningAttemptRows.filter((row) => String(row.answer || "").indexOf("Result: Correct") !== -1).length;

  return {
    totalRounds,
    daysUsed,
    completedDays,
    completionRate: daysUsed ? `${Math.round((completedDays / daysUsed) * 100)}%` : "0%",
    lastSevenRounds,
    totalAttempts,
    correctAttempts,
    attemptAccuracy: totalAttempts ? `${Math.round((correctAttempts / totalAttempts) * 100)}%` : "0%",
    lastUpdated: new Date(),
    dailyRows,
    sectionRows,
    talkRows: talkRows.slice(-25).reverse(),
    attemptRows
  };
}

function writeDashboard_(sheet, analysis) {
  sheet.getRange("A1:B1").breakApart();
  sheet.clear();
  const values = [
    ["Daily Adventure Dashboard", ""],
    ["Last Updated", analysis.lastUpdated],
    ["Expected Rounds Per Complete Day", EXPECTED_DAILY_ROUNDS],
    ["Total Rounds Completed", analysis.totalRounds],
    ["Days Used", analysis.daysUsed],
    ["Completed Days", analysis.completedDays],
    ["Completion Rate", analysis.completionRate],
    ["Rounds In Last 7 Days", analysis.lastSevenRounds],
    ["Learning Game Attempts", analysis.totalAttempts],
    ["Learning Game Correct", analysis.correctAttempts],
    ["Learning Game Accuracy", analysis.attemptAccuracy],
    ["", ""],
    ["What to look for", "Use this as a quick caregiver view. Daily Summary shows consistency. Section Summary shows required practice. Learning Attempts shows extra-game attempts and accuracy. Recent Talk Time shows typed responses."]
  ];

  sheet.getRange(1, 1, values.length, 2).setValues(values);
  sheet.getRange("A1:B1").merge().setFontSize(16).setFontWeight("bold");
  sheet.getRange("A2:A11").setFontWeight("bold");
  sheet.getRange("B2").setNumberFormat("m/d/yyyy h:mm AM/PM");
  sheet.setColumnWidths(1, 2, 260);
  sheet.setFrozenRows(1);
}

function buildParentView_(analysis) {
  const todayKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const todayRow = analysis.dailyRows.find((row) => row[0] === todayKey) || null;
  const recentDaily = analysis.dailyRows.slice(-7).reverse().map((row) => ({
    date: row[0],
    mood: row[2],
    plan: row[3],
    curriculumDay: row[4],
    rounds: row[5],
    completion: row[6],
    status: row[7],
    memory: row[8],
    lifeSkill: row[9],
    spanish: row[10],
    talkTime: row[11],
    moneyMath: row[12],
    lastCompleted: formatPromptValue_(row[13])
  }));

  return {
    ok: true,
    updatedAt: new Date().toISOString(),
    dashboard: {
      totalRounds: analysis.totalRounds,
      daysUsed: analysis.daysUsed,
      completedDays: analysis.completedDays,
      completionRate: analysis.completionRate,
      lastSevenRounds: analysis.lastSevenRounds,
      totalAttempts: analysis.totalAttempts,
      correctAttempts: analysis.correctAttempts,
      attemptAccuracy: analysis.attemptAccuracy
    },
    today: todayRow ? {
      date: todayRow[0],
      mood: todayRow[2],
      plan: todayRow[3],
      curriculumDay: todayRow[4],
      rounds: todayRow[5],
      completion: todayRow[6],
      status: todayRow[7],
      memory: todayRow[8],
      lifeSkill: todayRow[9],
      spanish: todayRow[10],
      talkTime: todayRow[11],
      moneyMath: todayRow[12],
      lastCompleted: formatPromptValue_(todayRow[13])
    } : null,
    recentDaily,
    recentTalk: analysis.talkRows.slice(0, 5).map((row) => ({
      timestamp: formatPromptValue_(row[0]),
      date: row[1],
      prompt: row[3],
      answer: row[4],
      responseType: row[5],
      answerLength: row[6]
    })),
    learningAttempts: analysis.attemptRows.map((row) => ({
      game: row[0],
      attempts: row[1],
      correct: row[2],
      accuracy: row[3],
      lastPrompt: row[4],
      lastAnswer: row[5],
      lastAttempt: formatPromptValue_(row[6])
    }))
  };
}

function writeDailySummary_(sheet, rows) {
  sheet.clear();
  const headers = [
    "Date",
    "Child Name",
    "Mood",
    "Plan",
    "Curriculum Day",
    "Rounds",
    "Completion %",
    "Status",
    "Memory",
    "Life Skill",
    "Spanish",
    "Talk Time",
    "Money Math",
    "Last Completed"
  ];
  writeTable_(sheet, headers, rows);
  sheet.getRange(2, 14, Math.max(rows.length, 1), 1).setNumberFormat("m/d/yyyy h:mm AM/PM");
}

function writeSectionSummary_(sheet, rows) {
  sheet.clear();
  const headers = ["Section", "Rounds Completed", "Days Practiced", "Last Completed"];
  writeTable_(sheet, headers, rows);
  sheet.getRange(2, 4, Math.max(rows.length, 1), 1).setNumberFormat("m/d/yyyy h:mm AM/PM");
}

function writeRecentTalk_(sheet, rows) {
  sheet.clear();
  const headers = ["Timestamp", "Date", "Child Name", "Prompt", "Answer", "Response Type", "Answer Length"];
  writeTable_(sheet, headers, rows);
  sheet.getRange(2, 1, Math.max(rows.length, 1), 1).setNumberFormat("m/d/yyyy h:mm AM/PM");
}

function writeLearningAttempts_(sheet, rows) {
  sheet.clear();
  const headers = ["Game / Skill", "Attempts", "Correct", "Accuracy", "Last Prompt", "Last Answer", "Last Attempt"];
  writeTable_(sheet, headers, rows);
  sheet.getRange(2, 7, Math.max(rows.length, 1), 1).setNumberFormat("m/d/yyyy h:mm AM/PM");
}

function writeGeminiPrompt_(sheet, analysis) {
  sheet.clear();
  const prompt = buildGeminiPrompt_(analysis);
  const values = [
    ["Gemini Prompt"],
    ["Copy the prompt below into Gemini when mom or dad wants a plain-English progress summary."],
    [prompt]
  ];

  sheet.getRange(1, 1, values.length, 1).setValues(values);
  sheet.getRange("A1").setFontSize(16).setFontWeight("bold").setBackground("#e5f4ef");
  sheet.getRange("A2").setFontWeight("bold");
  sheet.getRange("A3").setWrap(true).setVerticalAlignment("top");
  sheet.setColumnWidth(1, 900);
  sheet.setRowHeight(3, 520);
}

function buildGeminiPrompt_(analysis) {
  const recentDailyRows = analysis.dailyRows.slice(-7);
  const recentTalkRows = analysis.talkRows.slice(0, 10);
  const attemptRows = analysis.attemptRows;

  return [
    "You are helping mom and dad understand Zamaan's Daily Adventure progress.",
    "Please use a warm, practical caregiver tone. Do not diagnose. Focus on patterns, encouragement, and next practice ideas.",
    "",
    "Please provide:",
    "1. Three things Zamaan is doing well.",
    "2. Three areas to keep practicing.",
    "3. Patterns in Family Words / pronouns.",
    "4. Patterns in Money Math.",
    "5. Patterns in Talk Time responses.",
    "6. A short parent summary for this week.",
    "7. Two gentle recommendations for tomorrow.",
    "",
    "Dashboard:",
    `- Total completed rounds: ${analysis.totalRounds}`,
    `- Days used: ${analysis.daysUsed}`,
    `- Completed days: ${analysis.completedDays}`,
    `- Completion rate: ${analysis.completionRate}`,
    `- Rounds in last 7 days: ${analysis.lastSevenRounds}`,
    `- Learning game attempts: ${analysis.totalAttempts}`,
    `- Learning game correct: ${analysis.correctAttempts}`,
    `- Learning game accuracy: ${analysis.attemptAccuracy}`,
    "",
    "Recent Daily Summary:",
    formatPromptRows_(recentDailyRows, ["Date", "Child", "Mood", "Plan", "Day", "Rounds", "Completion", "Status", "Memory", "Life", "Spanish", "Talk", "Money Math", "Last Completed"]),
    "",
    "Learning Attempts:",
    formatPromptRows_(attemptRows, ["Game / Skill", "Attempts", "Correct", "Accuracy", "Last Prompt", "Last Answer", "Last Attempt"]),
    "",
    "Recent Talk Time:",
    formatPromptRows_(recentTalkRows, ["Timestamp", "Date", "Child", "Prompt", "Answer", "Response Type", "Answer Length"])
  ].join("\n");
}

function formatPromptRows_(rows, headers) {
  if (!rows.length) return "- No data yet.";

  return rows.map((row) => {
    return "- " + headers.map((header, index) => {
      return `${header}: ${formatPromptValue_(row[index])}`;
    }).join(" | ");
  }).join("\n");
}

function formatPromptValue_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd h:mm a");
  }
  return String(value || "");
}

function createJsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function writeTable_(sheet, headers, rows) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
  formatHeader_(sheet, headers.length);
  sheet.autoResizeColumns(1, headers.length);
}

function formatHeader_(sheet, width) {
  sheet.getRange(1, 1, 1, width).setFontWeight("bold").setBackground("#e5f4ef");
  sheet.setFrozenRows(1);
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function getTalkResponseType_(answer) {
  if (!answer) return "Blank";
  if (answer === "Said out loud or skipped typing.") return "Said out loud / skipped typing";
  return "Typed";
}

function normalizeDateKey_(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return String(value || "");
}

function parseDateKey_(value) {
  const parts = String(value || "").split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
