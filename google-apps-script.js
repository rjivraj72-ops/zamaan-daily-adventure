const FAMILY_CODE = "CHANGE_THIS_TO_A_PRIVATE_CODE";
const LOG_SHEET_NAME = "Daily Adventure Log";
const DASHBOARD_SHEET_NAME = "Dashboard";
const DAILY_SHEET_NAME = "Daily Summary";
const SECTION_SHEET_NAME = "Section Summary";
const TALK_SHEET_NAME = "Recent Talk Time";
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

function doGet() {
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
  const dailyMap = {};
  const sectionMap = {};
  const talkRows = [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  rows.forEach((row) => {
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

  const totalRounds = rows.length;
  const daysUsed = dailyRows.length;
  const completedDays = dailyRows.filter((row) => row[7] === "Complete").length;
  const lastSevenRounds = rows.filter((row) => {
    const date = parseDateKey_(row.date);
    return date && date >= sevenDaysAgo;
  }).length;

  return {
    totalRounds,
    daysUsed,
    completedDays,
    completionRate: daysUsed ? `${Math.round((completedDays / daysUsed) * 100)}%` : "0%",
    lastSevenRounds,
    lastUpdated: new Date(),
    dailyRows,
    sectionRows,
    talkRows: talkRows.slice(-25).reverse()
  };
}

function writeDashboard_(sheet, analysis) {
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
    ["", ""],
    ["What to look for", "Use this as a quick caregiver view. Daily Summary shows consistency. Section Summary shows which areas get the most practice. Recent Talk Time shows typed responses."]
  ];

  sheet.getRange(1, 1, values.length, 2).setValues(values);
  sheet.getRange("A1:B1").merge().setFontSize(16).setFontWeight("bold");
  sheet.getRange("A2:A8").setFontWeight("bold");
  sheet.getRange("B2").setNumberFormat("m/d/yyyy h:mm AM/PM");
  sheet.setColumnWidths(1, 2, 260);
  sheet.setFrozenRows(1);
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
