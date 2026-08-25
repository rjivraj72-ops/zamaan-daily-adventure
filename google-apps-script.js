const FAMILY_CODE = "CHANGE_THIS_TO_A_PRIVATE_CODE";
const LOG_SHEET_NAME = "Daily Adventure Log";
const DASHBOARD_SHEET_NAME = "Dashboard";
const DAILY_SHEET_NAME = "Daily Summary";
const SECTION_SHEET_NAME = "Section Summary";
const TALK_SHEET_NAME = "Recent Talk Time";
const ATTEMPTS_SHEET_NAME = "Learning Attempts";
const SKILL_MASTERY_SHEET_NAME = "skill_mastery";
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

  if (params.mode === "weeklyAdventureStatus") {
    if (params.familyCode !== FAMILY_CODE) {
      return createJsonResponse_({ ok: false, error: "Not allowed" });
    }
    return createJsonResponse_(getWeeklyAdventureAdminStatus_());
  }

  if (params.mode === "weeklyAdventureAction") {
    if (params.familyCode !== FAMILY_CODE) {
      return createJsonResponse_({ ok: false, error: "Not allowed" });
    }
    return createJsonResponse_(handleWeeklyAdventureAdminAction_(params));
  }

  if (params.familyCode !== FAMILY_CODE) {
    return ContentService.createTextOutput("Not allowed. Add ?familyCode=YOUR_FAMILY_CODE to the URL.");
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
  writeSkillMastery_(getOrCreateSheet_(spreadsheet, SKILL_MASTERY_SHEET_NAME), analysis.skillMasteryRows);
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
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - 6);
  currentWeekStart.setHours(0, 0, 0, 0);
  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(currentWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setMilliseconds(-1);

  const inRange = (row, start, end) => {
    const date = parseDateKey_(row.date);
    return date && date >= start && date <= end;
  };
  const currentCompletionRows = completionRows.filter((row) => inRange(row, currentWeekStart, today));
  const previousCompletionRows = completionRows.filter((row) => inRange(row, previousWeekStart, previousWeekEnd));
  const currentAttemptRows = learningAttemptRows.filter((row) => inRange(row, currentWeekStart, today));
  const previousAttemptRows = learningAttemptRows.filter((row) => inRange(row, previousWeekStart, previousWeekEnd));
  const currentCorrect = currentAttemptRows.filter((row) => String(row.answer || "").indexOf("Result: Correct") !== -1).length;
  const previousCorrect = previousAttemptRows.filter((row) => String(row.answer || "").indexOf("Result: Correct") !== -1).length;
  const currentCompleteDays = dailyRows.filter((row) => {
    const date = parseDateKey_(row[0]);
    return date && date >= currentWeekStart && date <= today && row[7] === "Complete";
  }).length;
  const previousCompleteDays = dailyRows.filter((row) => {
    const date = parseDateKey_(row[0]);
    return date && date >= previousWeekStart && date <= previousWeekEnd && row[7] === "Complete";
  }).length;

  const skillMap = {};
  currentAttemptRows.forEach((row) => {
    const skill = String(row.title || "Learning Game").split(":")[0].trim();
    const isCorrect = String(row.answer || "").indexOf("Result: Correct") !== -1;
    if (!skillMap[skill]) skillMap[skill] = { skill, attempts: 0, correct: 0 };
    skillMap[skill].attempts += 1;
    skillMap[skill].correct += isCorrect ? 1 : 0;
  });
  const skillTrends = Object.values(skillMap).map((item) => ({
    skill: item.skill,
    attempts: item.attempts,
    correct: item.correct,
    accuracy: item.attempts ? `${Math.round((item.correct / item.attempts) * 100)}%` : "0%"
  })).sort((a, b) => a.skill.localeCompare(b.skill));

  const missedMap = {};
  learningAttemptRows.slice(-100).forEach((row) => {
    if (String(row.answer || "").indexOf("Result: Correct") !== -1) return;
    const key = `${row.title}|${row.prompt}`;
    if (!missedMap[key]) missedMap[key] = { skill: row.title, prompt: row.prompt, misses: 0 };
    missedMap[key].misses += 1;
  });
  const missedQuestions = Object.values(missedMap).sort((a, b) => b.misses - a.misses).slice(0, 5);
  const skillMasteryItems = buildSkillMasteryItems_(learningAttemptRows);
  const skillMasteryRows = skillMasteryItems.map((item) => [
    item.skill_area,
    item.question_key,
    item.question_text,
    item.attempts,
    item.correct,
    item.accuracy,
    item.mastery_status,
    item.last_practiced,
    item.priority_score,
    item.next_practice_activity
  ]);
  const practiceNext = skillMasteryItems
    .filter((item) => item.mastery_status !== "Mastered")
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 3)
    .map((item) => ({
      skillArea: item.skill_area,
      questionKey: item.question_key,
      questionText: item.question_text,
      attempts: item.attempts,
      correct: item.correct,
      accuracy: `${item.accuracy}%`,
      masteryStatus: item.mastery_status,
      lastPracticed: formatPromptValue_(item.last_practiced),
      priorityScore: item.priority_score,
      nextPracticeActivity: item.next_practice_activity
    }));
  const masteryStrengths = skillMasteryItems
    .filter((item) => item.mastery_status === "Strong" || item.mastery_status === "Mastered")
    .sort((a, b) => b.accuracy - a.accuracy || b.attempts - a.attempts)
    .slice(0, 5)
    .map((item) => ({
      skillArea: item.skill_area,
      questionText: item.question_text,
      attempts: item.attempts,
      correct: item.correct,
      accuracy: `${item.accuracy}%`,
      masteryStatus: item.mastery_status,
      lastPracticed: formatPromptValue_(item.last_practiced),
      priorityScore: item.priority_score
    }));

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
    attemptRows,
    weeklyComparison: {
      currentRounds: currentCompletionRows.length,
      previousRounds: previousCompletionRows.length,
      currentCompleteDays,
      previousCompleteDays,
      currentAttempts: currentAttemptRows.length,
      previousAttempts: previousAttemptRows.length,
      currentAccuracy: currentAttemptRows.length ? `${Math.round((currentCorrect / currentAttemptRows.length) * 100)}%` : "0%",
      previousAccuracy: previousAttemptRows.length ? `${Math.round((previousCorrect / previousAttemptRows.length) * 100)}%` : "0%"
    },
    skillTrends,
    missedQuestions,
    skillMasteryRows,
    practiceNext,
    masteryStrengths
  };
}

function buildSkillMasteryItems_(learningAttemptRows) {
  const masteryMap = {};
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  learningAttemptRows.forEach((row) => {
    const skillArea = getSkillArea_(row.title);
    const questionTitle = getQuestionTitle_(row.title);
    const questionText = row.prompt || getQuestionTitle_(row.title) || "Learning question";
    const questionKey = makeQuestionKey_(skillArea, questionText);
    const isCorrect = String(row.answer || "").indexOf("Result: Correct") !== -1;
    const practicedAt = getPracticeDate_(row);

    if (!masteryMap[questionKey]) {
      masteryMap[questionKey] = {
        skill_area: skillArea,
        question_title: questionTitle,
        question_key: questionKey,
        question_text: questionText,
        attempts: 0,
        correct: 0,
        last_practiced: practicedAt,
        lastWasMissed: false,
        recentMisses: 0
      };
    }

    const item = masteryMap[questionKey];
    item.attempts += 1;
    item.correct += isCorrect ? 1 : 0;
    if (practicedAt && (!item.last_practiced || practicedAt > item.last_practiced)) {
      item.last_practiced = practicedAt;
      item.lastWasMissed = !isCorrect;
    }
    if (!isCorrect && practicedAt && daysBetween_(practicedAt, today) <= 3) {
      item.recentMisses += 1;
    }
  });

  return Object.values(masteryMap).map((item) => {
    const accuracy = item.attempts ? Math.round((item.correct / item.attempts) * 100) : 0;
    const masteryStatus = getMasteryStatus_(accuracy, item.attempts);
    const daysSincePractice = item.last_practiced ? daysBetween_(item.last_practiced, today) : 99;
    const priorityScore = getPriorityScore_(accuracy, item.attempts, item.recentMisses, daysSincePractice, masteryStatus);

    return {
      ...item,
      accuracy,
      mastery_status: masteryStatus,
      priority_score: priorityScore,
      next_practice_activity: getNextPracticeActivity_(item.skill_area, item.question_title, item.question_text)
    };
  }).sort((a, b) => b.priority_score - a.priority_score || a.skill_area.localeCompare(b.skill_area));
}

function getSkillArea_(title) {
  return String(title || "Learning Game").split(":")[0].trim() || "Learning Game";
}

function getQuestionTitle_(title) {
  const parts = String(title || "").split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : String(title || "").trim();
}

function makeQuestionKey_(skillArea, questionText) {
  const value = `${skillArea}-${questionText}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return value.slice(0, 90) || "learning-question";
}

function getPracticeDate_(row) {
  if (Object.prototype.toString.call(row.timestamp) === "[object Date]") return row.timestamp;
  const parsedDate = parseDateKey_(row.date);
  return parsedDate || new Date();
}

function daysBetween_(earlier, later) {
  const start = new Date(earlier);
  start.setHours(0, 0, 0, 0);
  const end = new Date(later);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((end - start) / 86400000));
}

function getMasteryStatus_(accuracy, attempts) {
  if (accuracy >= 90 && attempts >= 5) return "Mastered";
  if (accuracy >= 80) return "Strong";
  if (accuracy >= 60) return "Practicing";
  return "Learning";
}

function getPriorityScore_(accuracy, attempts, recentMisses, daysSincePractice, masteryStatus) {
  const accuracyScore = Math.max(0, 100 - accuracy);
  const lowAttemptScore = attempts < 5 ? (5 - attempts) * 8 : 0;
  const recentMissScore = Math.min(recentMisses * 18, 36);
  const staleScore = daysSincePractice >= 7 ? Math.min(30, 10 + ((daysSincePractice - 7) * 2)) : 0;
  const statusScore = masteryStatus === "Learning" ? 25 : masteryStatus === "Practicing" ? 15 : masteryStatus === "Strong" ? 5 : -50;
  return Math.max(0, Math.round(accuracyScore + lowAttemptScore + recentMissScore + staleScore + statusScore));
}

function getNextPracticeActivity_(skillArea, questionTitle, questionText) {
  const skill = String(skillArea || "").toLowerCase();
  const title = questionTitle || questionText || "this question";

  if (skill.indexOf("family") !== -1) {
    return `Look at a family photo and ask: "${questionText}" Then ask Zamaan to answer with "my" or "his" in a full sentence.`;
  }
  if (skill.indexOf("money") !== -1) {
    return `Use real or play dollars for 2 minutes. Ask: "${questionText}" Let Zamaan count out the answer, then say the full sentence.`;
  }
  if (skill.indexOf("spanish") !== -1) {
    return `Make 3 quick cards for this word. Say the English word, let Zamaan choose the Spanish word, then have him repeat both words.`;
  }
  if (skill.indexOf("business") !== -1) {
    return `Role-play a short buyer conversation. Ask the question, let Zamaan choose the best answer, then practice saying it kindly.`;
  }
  if (skill.indexOf("pattern") !== -1) {
    return `Use colored objects to copy the pattern, then ask Zamaan what comes next before tapping the answer.`;
  }
  if (skill.indexOf("sort") !== -1) {
    return `Put 4 real objects or picture cards on the table and ask Zamaan to sort them into two simple groups.`;
  }
  return `Practice "${title}" once out loud, once with choices, and once again after a short break.`;
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
    ["What to look for", "Use this as a quick caregiver view. Daily Summary shows consistency. Section Summary shows required practice. Learning Attempts shows attempts and accuracy. skill_mastery shows mastery status and what to practice next."]
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
  const recentTalk = analysis.talkRows.slice(0, 2).map((row) => ({
    timestamp: formatPromptValue_(row[0]),
    date: row[1],
    prompt: row[3],
    answer: row[4],
    responseType: row[5],
    answerLength: row[6]
  }));
  const learningAttempts = analysis.attemptRows.map((row) => ({
    game: row[0],
    attempts: row[1],
    correct: row[2],
    accuracy: row[3],
    lastPrompt: row[4],
    lastAnswer: row[5],
    lastAttempt: formatPromptValue_(row[6])
  }));
  const needsPractice = buildNeedsPractice_(recentDaily, recentTalk, learningAttempts);

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
    weeklyTrend: {
      daysUsed: recentDaily.length,
      completeDays: recentDaily.filter((day) => day.status === "Complete").length,
      rounds: recentDaily.reduce((total, day) => total + Number(day.rounds || 0), 0),
      talkAnswers: recentTalk.length
    },
    weeklyComparison: analysis.weeklyComparison,
    skillTrends: analysis.skillTrends,
    missedQuestions: analysis.missedQuestions,
    practiceNext: analysis.practiceNext,
    masteryStrengths: analysis.masteryStrengths,
    needsPractice,
    recentDaily,
    recentTalk,
    learningAttempts
  };
}

function buildNeedsPractice_(recentDaily, recentTalk, learningAttempts) {
  const items = [];
  const latestDay = recentDaily[0];

  if (latestDay && Number(latestDay.rounds || 0) < EXPECTED_DAILY_ROUNDS) {
    items.push({
      title: "Finish all daily rounds",
      detail: `${latestDay.rounds} of ${EXPECTED_DAILY_ROUNDS} rounds completed today.`
    });
  }

  learningAttempts.forEach((item) => {
    const attempts = Number(item.attempts || 0);
    const correct = Number(item.correct || 0);
    const accuracy = attempts ? Math.round((correct / attempts) * 100) : 0;

    if (attempts >= 2 && accuracy < 70) {
      items.push({
        title: item.game,
        detail: `${correct} correct out of ${attempts} attempts.`
      });
    }
  });

  const shortTalkAnswers = recentTalk.filter((item) => {
    return item.responseType !== "Blank" && Number(item.answerLength || 0) > 0 && Number(item.answerLength || 0) < 45;
  }).length;

  if (recentTalk.length && shortTalkAnswers === recentTalk.length) {
    items.push({
      title: "Talk Time sentences",
      detail: "Recent typed answers are short. Practice 1 or 2 full sentences."
    });
  }

  if (!items.length) {
    items.push({
      title: "Keep the routine going",
      detail: "No clear practice gap yet. Keep building several days of data."
    });
  }

  return items.slice(0, 2);
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

function writeSkillMastery_(sheet, rows) {
  sheet.clear();
  const headers = [
    "skill_area",
    "question_key",
    "question_text",
    "attempts",
    "correct",
    "accuracy",
    "mastery_status",
    "last_practiced",
    "priority_score",
    "next_practice_activity"
  ];
  writeTable_(sheet, headers, rows);
  sheet.getRange(2, 6, Math.max(rows.length, 1), 1).setNumberFormat("0");
  sheet.getRange(2, 8, Math.max(rows.length, 1), 1).setNumberFormat("m/d/yyyy h:mm AM/PM");
  sheet.getRange(2, 10, Math.max(rows.length, 1), 1).setWrap(true);
  sheet.setColumnWidths(1, 10, 160);
  sheet.setColumnWidth(3, 320);
  sheet.setColumnWidth(10, 420);
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
