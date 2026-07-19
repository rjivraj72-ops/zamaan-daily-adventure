const WEEKLY_ADVENTURE_RECIPIENTS = "";
const WEEKLY_ADVENTURE_SEND_HOUR = 10; // 10:00 AM in the Apps Script project time zone.
const WEEKLY_ADVENTURE_SENDER_NAME = "Zamaan's Daily Adventure";
const WEEKLY_ADVENTURE_RECIPIENTS_PROPERTY = "WEEKLY_ADVENTURE_RECIPIENTS";
const WEEKLY_ADVENTURE_SEND_HOUR_PROPERTY = "WEEKLY_ADVENTURE_SEND_HOUR";
const WEEKLY_ADVENTURE_LAST_SENT_PROPERTY = "WEEKLY_ADVENTURE_LAST_SENT_AT";

/**
 * Sends a real preview using the latest data.
 * This does not install a recurring trigger.
 */
function sendWeeklyAdventureTest() {
  sendWeeklyAdventureEmail_(true);
}

/**
 * Scheduled entry point. The weekly trigger calls this function.
 */
function sendWeeklyAdventureEmail() {
  sendWeeklyAdventureEmail_(false);
}

/**
 * Installs one weekly Sunday trigger at approximately the configured send hour.
 * Apps Script time triggers can run within the selected hour.
 */
function installWeeklyAdventureTrigger() {
  removeWeeklyAdventureTriggers();

  ScriptApp.newTrigger("sendWeeklyAdventureEmail")
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.SUNDAY)
    .atHour(getWeeklyAdventureSendHour_())
    .inTimezone(Session.getScriptTimeZone())
    .create();

  console.log(
    `Zamaan's Weekly Adventure is scheduled for Sundays near ${getWeeklyAdventureSendHour_()}:00 ` +
    `(${Session.getScriptTimeZone()}).`
  );
}

/**
 * Removes only triggers created for the Weekly Adventure email.
 */
function removeWeeklyAdventureTriggers() {
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "sendWeeklyAdventureEmail")
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger));
}

/**
 * Returns a quick setup/status check in the execution log.
 */
function checkWeeklyAdventureSetup() {
  const recipients = getWeeklyAdventureRecipients_();
  const triggerCount = ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === "sendWeeklyAdventureEmail")
    .length;

  console.log(`Recipients: ${recipients.join(", ")}`);
  console.log(`Weekly trigger installed: ${triggerCount > 0 ? "Yes" : "No"}`);
  console.log(`Project time zone: ${Session.getScriptTimeZone()}`);
}

/**
 * Internal email sender.
 */
function sendWeeklyAdventureEmail_(isTest) {
  const recipients = getWeeklyAdventureRecipients_();

  const logSheet = getLogSheet_();
  const rows = getLogRows_(logSheet);
  const analysis = buildAnalysis_(rows);
  const parentView = buildParentView_(analysis);
  const skillComparison = buildWeeklySkillComparison_(rows);
  const skillChart = buildWeeklySkillChart_(skillComparison);
  const email = buildWeeklyAdventureEmail_(
    analysis,
    parentView,
    isTest,
    skillComparison,
    Boolean(skillChart)
  );

  const message = {
    to: recipients.join(","),
    subject: email.subject,
    body: email.plainText,
    htmlBody: email.html,
    name: WEEKLY_ADVENTURE_SENDER_NAME
  };

  if (skillChart) {
    message.inlineImages = {
      weeklySkillChart: skillChart
    };
  }

  MailApp.sendEmail(message);

  PropertiesService.getScriptProperties().setProperty(
    WEEKLY_ADVENTURE_LAST_SENT_PROPERTY,
    new Date().toISOString()
  );

  console.log(`Weekly Adventure sent to ${recipients.join(", ")}.`);
}

/**
 * Validates and returns configured recipients.
 */
function getWeeklyAdventureRecipients_() {
  const recipients = getWeeklyAdventureConfiguredRecipients_();

  const stillHasPlaceholder = recipients.some((email) =>
    email.indexOf("REPLACE_WITH_EMAIL") !== -1
  );

  if (!recipients.length || stillHasPlaceholder) {
    throw new Error(
      "Add the parent/caregiver email addresses to WEEKLY_ADVENTURE_RECIPIENTS first."
    );
  }

  const invalid = recipients.filter((email) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  if (invalid.length) {
    throw new Error(`Invalid email address: ${invalid.join(", ")}`);
  }

  return recipients;
}

function getWeeklyAdventureConfiguredRecipients_() {
  const configuredRecipients = PropertiesService.getScriptProperties()
    .getProperty(WEEKLY_ADVENTURE_RECIPIENTS_PROPERTY);
  return String(configuredRecipients || WEEKLY_ADVENTURE_RECIPIENTS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
}

function getWeeklyAdventureSendHour_() {
  const configuredHour = PropertiesService.getScriptProperties()
    .getProperty(WEEKLY_ADVENTURE_SEND_HOUR_PROPERTY);
  const hour = configuredHour === null
    ? WEEKLY_ADVENTURE_SEND_HOUR
    : Number(configuredHour);

  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return WEEKLY_ADVENTURE_SEND_HOUR;
  }

  return hour;
}

function getWeeklyAdventureAdminStatus_() {
  try {
    return buildWeeklyAdventureStatus_();
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function handleWeeklyAdventureAdminAction_(params) {
  try {
    const action = String(params.action || "").trim().toLowerCase();

    if (action === "save") {
      saveWeeklyAdventureSettings_(params.recipients, params.sendHour);
      return Object.assign(buildWeeklyAdventureStatus_(), {
        message: "Weekly Adventure saved and scheduled."
      });
    }

    if (action === "test") {
      sendWeeklyAdventureTest();
      return Object.assign(buildWeeklyAdventureStatus_(), {
        message: "Test Weekly Adventure email sent."
      });
    }

    if (action === "disable") {
      removeWeeklyAdventureTriggers();
      return Object.assign(buildWeeklyAdventureStatus_(), {
        message: "Weekly Adventure emails disabled."
      });
    }

    throw new Error("Unknown Weekly Adventure action.");
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

function saveWeeklyAdventureSettings_(recipientsValue, sendHourValue) {
  const recipients = validateWeeklyAdventureRecipients_(recipientsValue);
  const sendHour = Number(sendHourValue);

  if (!Number.isInteger(sendHour) || sendHour < 0 || sendHour > 23) {
    throw new Error("Choose a valid Sunday send time.");
  }

  PropertiesService.getScriptProperties().setProperties({
    [WEEKLY_ADVENTURE_RECIPIENTS_PROPERTY]: recipients.join(","),
    [WEEKLY_ADVENTURE_SEND_HOUR_PROPERTY]: String(sendHour)
  });
  installWeeklyAdventureTrigger();
}

function validateWeeklyAdventureRecipients_(value) {
  const recipients = String(value || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  const invalid = recipients.filter((email) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  if (!recipients.length) {
    throw new Error("Add at least one recipient email address.");
  }
  if (invalid.length) {
    throw new Error(`Invalid email address: ${invalid.join(", ")}`);
  }

  return recipients;
}

function buildWeeklyAdventureStatus_() {
  const triggers = ScriptApp.getProjectTriggers().filter((trigger) =>
    trigger.getHandlerFunction() === "sendWeeklyAdventureEmail"
  );
  const properties = PropertiesService.getScriptProperties();

  return {
    ok: true,
    enabled: triggers.length > 0,
    recipients: getWeeklyAdventureConfiguredRecipients_().join(", "),
    sendHour: getWeeklyAdventureSendHour_(),
    timezone: Session.getScriptTimeZone(),
    lastSentAt: properties.getProperty(WEEKLY_ADVENTURE_LAST_SENT_PROPERTY) || "",
    triggerCount: triggers.length
  };
}

/**
 * Builds all subject, HTML, and plain-text content.
 */
function buildWeeklyAdventureEmail_(analysis, parentView, isTest, skillComparison, hasSkillChart) {
  const comparison = analysis.weeklyComparison || {};
  const strengths = getUniqueWeeklyAdventureSkills_(
    analysis.masteryStrengths || [],
    3
  );
  const priorities = getUniqueWeeklyAdventureSkills_(
    analysis.practiceNext || [],
    2
  );
  const talkMoment = getWeeklyTalkMoment_(analysis);
  const dateRange = getWeeklyAdventureDateRange_();
  const dashboardUrl = getWeeklyAdventureDashboardUrl_();

  const currentRounds = Number(comparison.currentRounds || analysis.lastSevenRounds || 0);
  const currentAttempts = Number(comparison.currentAttempts || 0);
  const currentAccuracy = comparison.currentAccuracy || "0%";
  const currentCompleteDays = Number(comparison.currentCompleteDays || 0);
  const activeDays = getCurrentWeekActiveDays_(analysis.dailyRows || []);
  const talkCount = getCurrentWeekTalkCount_(analysis.talkRows || []);

  const summary = buildWeeklyAdventureSummary_({
    childName: getWeeklyAdventureChildName_(analysis),
    currentRounds,
    activeDays,
    currentCompleteDays,
    currentAttempts,
    currentAccuracy,
    previousRounds: Number(comparison.previousRounds || 0),
    previousAccuracy: comparison.previousAccuracy || "0%",
    strengths,
    priorities
  });

  const subjectPrefix = isTest ? "[TEST] " : "";
  const subject = `${subjectPrefix}🌟 Zamaan's Weekly Adventure — ${dateRange}`;

  const strengthHtml = strengths.length
    ? strengths.map((item) => weeklyAdventureListItem_(
        item.skillArea,
        `${item.masteryStatus} · ${item.accuracy} accuracy`
      )).join("")
    : weeklyAdventureEmptyItem_("Complete more learning games to begin identifying strengths.");

  const priorityHtml = priorities.length
    ? priorities.map((item) => weeklyAdventureListItem_(
        item.skillArea,
        `${item.questionText} · ${item.masteryStatus}`
      )).join("")
    : weeklyAdventureEmptyItem_("No clear practice priority yet. Keep building the routine.");

  const activityHtml = priorities.length
    ? priorities.map((item, index) => `
        <div style="padding:16px 0;${index ? "border-top:1px solid #e7ecea;" : ""}">
          <div style="font-size:13px;font-weight:700;color:#247c6d;text-transform:uppercase;letter-spacing:.6px;">
            Family Adventure ${index + 1}
          </div>
          <div style="margin-top:6px;font-size:16px;line-height:1.55;color:#26332f;">
            ${escapeWeeklyAdventureHtml_(item.nextPracticeActivity)}
          </div>
        </div>
      `).join("")
    : `<p style="margin:0;color:#52635d;line-height:1.6;">Keep practising one favourite activity together this week.</p>`;

  const talkHtml = talkMoment
    ? `
      <div style="font-size:15px;color:#52635d;line-height:1.55;">
        ${escapeWeeklyAdventureHtml_(talkMoment.prompt)}
      </div>
      <div style="margin-top:12px;padding:16px 18px;border-left:4px solid #e1a83b;background:#fffaf0;
                  border-radius:8px;font-size:18px;line-height:1.55;color:#26332f;font-style:italic;">
        “${escapeWeeklyAdventureHtml_(talkMoment.answer)}”
      </div>
    `
    : `<p style="margin:0;color:#52635d;line-height:1.6;">No typed Talk Time response was recorded this week.</p>`;

  const testBanner = isTest
    ? `<div style="background:#fff3cd;color:#6a5200;padding:10px 16px;text-align:center;font-size:13px;font-weight:700;">
         TEST EMAIL — the weekly trigger has not been changed.
       </div>`
    : "";

  const html = `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f3f7f5;font-family:Arial,Helvetica,sans-serif;color:#26332f;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
           style="background:#f3f7f5;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                 style="max-width:680px;background:#ffffff;border-radius:20px;overflow:hidden;
                        box-shadow:0 8px 28px rgba(35,70,60,.10);">
            <tr><td>${testBanner}</td></tr>
            <tr>
              <td style="background:#247c6d;padding:36px 34px;text-align:center;">
                <div style="font-size:34px;line-height:1;">🌟</div>
                <h1 style="margin:12px 0 6px;color:#ffffff;font-size:30px;line-height:1.2;">
                  Zamaan's Weekly Adventure
                </h1>
                <div style="color:#d9f0ea;font-size:15px;">${escapeWeeklyAdventureHtml_(dateRange)}</div>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 34px 10px;">
                <div style="font-size:13px;font-weight:700;color:#247c6d;text-transform:uppercase;
                            letter-spacing:.7px;">This Week's Adventure</div>
                <p style="margin:10px 0 0;font-size:18px;line-height:1.65;color:#26332f;">
                  ${escapeWeeklyAdventureHtml_(summary)}
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 34px;">
                <table role="presentation" width="100%" cellspacing="8" cellpadding="0" border="0">
                  <tr>
                    ${weeklyAdventureMetricCard_("Rounds", currentRounds)}
                    ${weeklyAdventureMetricCard_("Accuracy", currentAccuracy)}
                  </tr>
                  <tr>
                    ${weeklyAdventureMetricCard_("Complete days", currentCompleteDays)}
                    ${weeklyAdventureMetricCard_("Talk Time", talkCount)}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:12px 34px 0;">
                ${weeklyAdventureSection_(
                  "📊 Weekly Accuracy by Skill Area",
                  buildWeeklySkillChartSectionHtml_(skillComparison, hasSkillChart)
                )}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 0;">
                ${weeklyAdventureSection_(
                  "🎉 Celebrate This Week",
                  `<div>${strengthHtml}</div>`
                )}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 0;">
                ${weeklyAdventureSection_(
                  "🌱 Growing Next Week",
                  `<div>${priorityHtml}</div>`
                )}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 0;">
                ${weeklyAdventureSection_("🏡 Family Adventures", activityHtml)}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 0;">
                ${weeklyAdventureSection_("💬 Talk Time Moment", talkHtml)}
              </td>
            </tr>

            <tr>
              <td style="padding:18px 34px 0;">
                ${weeklyAdventureSection_(
                  "📈 Week-over-Week",
                  buildWeeklyVisualComparisonHtml_(comparison)
                )}
              </td>
            </tr>

            <tr>
              <td style="padding:26px 34px 34px;text-align:center;">
                <a href="${escapeWeeklyAdventureHtml_(dashboardUrl)}"
                   style="display:inline-block;background:#247c6d;color:#ffffff;text-decoration:none;
                          padding:13px 22px;border-radius:999px;font-weight:700;font-size:15px;">
                  Open the full Dashboard
                </a>
                <p style="margin:26px 0 0;color:#52635d;font-size:15px;line-height:1.6;">
                  <strong style="color:#26332f;">Every adventure builds confidence.</strong><br>
                  Thank you for learning alongside Zamaan this week.
                </p>
              </td>
            </tr>

            <tr>
              <td style="background:#edf5f2;padding:18px 28px;text-align:center;color:#62736d;font-size:12px;">
                Sent automatically by Zamaan's Daily Adventure.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const plainText = [
    `ZAMAAN'S WEEKLY ADVENTURE — ${dateRange}`,
    "",
    "THIS WEEK'S ADVENTURE",
    summary,
    "",
    "AT A GLANCE",
    `Rounds: ${currentRounds}`,
    `Accuracy: ${currentAccuracy}`,
    `Complete days: ${currentCompleteDays}`,
    `Talk Time responses: ${talkCount}`,
    "",
    "WEEKLY ACCURACY BY SKILL AREA",
    ...buildWeeklySkillComparisonPlainText_(skillComparison),
    "",
    "CELEBRATE THIS WEEK",
    ...(strengths.length
      ? strengths.map((item) => `- ${item.skillArea}: ${item.masteryStatus}, ${item.accuracy}`)
      : ["- Complete more learning games to begin identifying strengths."]),
    "",
    "GROWING NEXT WEEK",
    ...(priorities.length
      ? priorities.map((item) => `- ${item.skillArea}: ${item.questionText}`)
      : ["- Keep building the daily routine."]),
    "",
    "FAMILY ADVENTURES",
    ...(priorities.length
      ? priorities.map((item, index) => `${index + 1}. ${item.nextPracticeActivity}`)
      : ["1. Practise one favourite activity together."]),
    "",
    "TALK TIME MOMENT",
    talkMoment ? `${talkMoment.prompt}\n"${talkMoment.answer}"` : "No typed response recorded this week.",
    "",
    `Full Dashboard: ${dashboardUrl}`,
    "",
    "Every adventure builds confidence."
  ].join("\n");

  return { subject, html, plainText };
}


function getUniqueWeeklyAdventureSkills_(items, limit) {
  const seen = {};
  const unique = [];

  (items || []).forEach((item) => {
    const skillArea = String(item.skillArea || "Learning").trim();
    const key = skillArea.toLowerCase();

    if (seen[key]) return;

    seen[key] = true;
    unique.push(item);
  });

  return unique.slice(0, limit);
}

function buildWeeklyAdventureSummary_(data) {
  const parts = [];
  const childName = data.childName || "Zamaan";

  parts.push(
    `${childName} completed ${data.currentRounds} learning round${data.currentRounds === 1 ? "" : "s"} ` +
    `across ${data.activeDays} active day${data.activeDays === 1 ? "" : "s"} this week.`
  );

  if (data.strengths.length) {
    const top = data.strengths[0];
    parts.push(`${top.skillArea} was a strength, with ${top.accuracy} accuracy.`);
  } else if (data.currentAttempts > 0) {
    parts.push(`Learning-game accuracy was ${data.currentAccuracy}.`);
  }

  if (data.priorities.length) {
    const focus = data.priorities[0];
    parts.push(`${focus.skillArea} is the best focus for the week ahead.`);
  } else {
    parts.push("The best next step is to keep the daily learning routine going.");
  }

  return parts.join(" ");
}

function getWeeklyAdventureChildName_(analysis) {
  const recent = (analysis.dailyRows || []).slice(-1)[0];
  return recent && recent[1] ? String(recent[1]) : "Zamaan";
}

function getWeeklyAdventureDateRange_() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 6);

  const timezone = Session.getScriptTimeZone();
  const sameMonth = start.getMonth() === end.getMonth();

  const startText = Utilities.formatDate(
    start,
    timezone,
    sameMonth ? "MMM d" : "MMM d"
  );
  const endText = Utilities.formatDate(end, timezone, "MMM d, yyyy");
  return `${startText}–${endText}`;
}

function getCurrentWeekStart_() {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getCurrentWeekActiveDays_(dailyRows) {
  const start = getCurrentWeekStart_();
  return (dailyRows || []).filter((row) => {
    const date = parseDateKey_(row[0]);
    return date && date >= start;
  }).length;
}

function getCurrentWeekTalkCount_(talkRows) {
  const start = getCurrentWeekStart_();
  return (talkRows || []).filter((row) => {
    const date = parseDateKey_(row[1]);
    return date && date >= start;
  }).length;
}

function getWeeklyTalkMoment_(analysis) {
  const start = getCurrentWeekStart_();

  const typed = (analysis.talkRows || []).find((row) => {
    const date = parseDateKey_(row[1]);
    const answer = String(row[4] || "").trim();
    return date &&
      date >= start &&
      answer &&
      answer !== "Said out loud or skipped typing.";
  });

  if (!typed) return null;

  return {
    prompt: String(typed[3] || "Talk Time"),
    answer: String(typed[4] || "")
  };
}

function getWeeklyAdventureDashboardUrl_() {
  const spreadsheet = SpreadsheetApp.getActive();
  const dashboard = spreadsheet.getSheetByName(DASHBOARD_SHEET_NAME);
  return dashboard
    ? `${spreadsheet.getUrl()}#gid=${dashboard.getSheetId()}`
    : spreadsheet.getUrl();
}

function buildWeeklyVisualComparisonHtml_(comparison) {
  const metrics = [
    {
      label: "Rounds",
      current: Number(comparison.currentRounds || 0),
      previous: Number(comparison.previousRounds || 0),
      suffix: ""
    },
    {
      label: "Complete days",
      current: Number(comparison.currentCompleteDays || 0),
      previous: Number(comparison.previousCompleteDays || 0),
      suffix: ""
    },
    {
      label: "Game accuracy",
      current: parseWeeklyAdventurePercent_(comparison.currentAccuracy),
      previous: parseWeeklyAdventurePercent_(comparison.previousAccuracy),
      suffix: "%"
    }
  ];

  return metrics.map((metric) => weeklyAdventureTrendRow_(metric)).join("");
}

function weeklyAdventureTrendRow_(metric) {
  const maxValue = Math.max(metric.current, metric.previous, 1);
  const currentWidth = Math.max(4, Math.round((metric.current / maxValue) * 100));
  const previousWidth = Math.max(4, Math.round((metric.previous / maxValue) * 100));
  const difference = metric.current - metric.previous;
  const trend = difference > 0 ? "▲" : difference < 0 ? "▼" : "•";
  const trendText = difference > 0
    ? `Up ${Math.abs(difference)}${metric.suffix}`
    : difference < 0
      ? `Down ${Math.abs(difference)}${metric.suffix}`
      : "No change";

  return `
    <div style="padding:14px 0;border-bottom:1px solid #edf2f0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="font-size:15px;font-weight:700;color:#26332f;">
            ${escapeWeeklyAdventureHtml_(metric.label)}
          </td>
          <td style="text-align:right;font-size:13px;color:#247c6d;font-weight:700;">
            ${trend} ${escapeWeeklyAdventureHtml_(trendText)}
          </td>
        </tr>
      </table>

      <div style="margin-top:11px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="78" style="font-size:12px;color:#6c7b76;">This week</td>
            <td>
              <div style="height:10px;background:#e7efec;border-radius:999px;overflow:hidden;">
                <div style="width:${currentWidth}%;height:10px;background:#247c6d;border-radius:999px;"></div>
              </div>
            </td>
            <td width="54" style="text-align:right;font-size:13px;font-weight:700;color:#26332f;">
              ${escapeWeeklyAdventureHtml_(`${metric.current}${metric.suffix}`)}
            </td>
          </tr>
          <tr>
            <td width="78" style="padding-top:8px;font-size:12px;color:#6c7b76;">Last week</td>
            <td style="padding-top:8px;">
              <div style="height:10px;background:#edf2f0;border-radius:999px;overflow:hidden;">
                <div style="width:${previousWidth}%;height:10px;background:#a8b8b2;border-radius:999px;"></div>
              </div>
            </td>
            <td width="54" style="padding-top:8px;text-align:right;font-size:13px;color:#52635d;">
              ${escapeWeeklyAdventureHtml_(`${metric.previous}${metric.suffix}`)}
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;
}

function parseWeeklyAdventurePercent_(value) {
  const number = Number(String(value || "0").replace("%", ""));
  return Number.isFinite(number) ? number : 0;
}

function weeklyAdventureSection_(title, body) {
  return `
    <div style="border:1px solid #dfe9e5;border-radius:16px;padding:22px;background:#ffffff;">
      <h2 style="margin:0 0 14px;font-size:20px;color:#26332f;">${title}</h2>
      ${body}
    </div>
  `;
}

function weeklyAdventureListItem_(title, detail) {
  return `
    <div style="padding:11px 0;border-bottom:1px solid #edf2f0;">
      <div style="font-size:16px;font-weight:700;color:#26332f;">
        ${escapeWeeklyAdventureHtml_(title)}
      </div>
      <div style="margin-top:4px;font-size:14px;color:#63736d;">
        ${escapeWeeklyAdventureHtml_(detail)}
      </div>
    </div>
  `;
}

function weeklyAdventureEmptyItem_(message) {
  return `
    <div style="padding:8px 0;color:#63736d;font-size:15px;line-height:1.55;">
      ${escapeWeeklyAdventureHtml_(message)}
    </div>
  `;
}

function weeklyAdventureMetricCard_(label, value) {
  return `
    <td width="50%" style="padding:4px;">
      <div style="background:#edf5f2;border-radius:14px;padding:17px;text-align:center;">
        <div style="font-size:25px;font-weight:800;color:#247c6d;">
          ${escapeWeeklyAdventureHtml_(value)}
        </div>
        <div style="margin-top:5px;font-size:13px;color:#61726c;">
          ${escapeWeeklyAdventureHtml_(label)}
        </div>
      </div>
    </td>
  `;
}


function buildWeeklySkillComparison_(rows) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - 6);
  currentStart.setHours(0, 0, 0, 0);

  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - 7);

  const previousEnd = new Date(currentStart);
  previousEnd.setMilliseconds(-1);

  const buckets = {};

  (rows || [])
    .filter((row) => row.section === "Learning Game Attempt")
    .forEach((row) => {
      const date = parseDateKey_(row.date);
      if (!date) return;

      let period = "";
      if (date >= currentStart && date <= today) {
        period = "current";
      } else if (date >= previousStart && date <= previousEnd) {
        period = "previous";
      } else {
        return;
      }

      const skill = getSkillArea_(row.title);
      if (!buckets[skill]) {
        buckets[skill] = {
          skill,
          currentAttempts: 0,
          currentCorrect: 0,
          previousAttempts: 0,
          previousCorrect: 0
        };
      }

      const item = buckets[skill];
      const isCorrect = String(row.answer || "").indexOf("Result: Correct") !== -1;

      if (period === "current") {
        item.currentAttempts += 1;
        item.currentCorrect += isCorrect ? 1 : 0;
      } else {
        item.previousAttempts += 1;
        item.previousCorrect += isCorrect ? 1 : 0;
      }
    });

  return Object.values(buckets)
    .filter((item) => item.currentAttempts > 0 || item.previousAttempts > 0)
    .map((item) => ({
      skill: item.skill,
      currentAccuracy: item.currentAttempts
        ? Math.round((item.currentCorrect / item.currentAttempts) * 100)
        : 0,
      previousAccuracy: item.previousAttempts
        ? Math.round((item.previousCorrect / item.previousAttempts) * 100)
        : 0,
      currentAttempts: item.currentAttempts,
      previousAttempts: item.previousAttempts
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill));
}

function buildWeeklySkillChart_(comparisonRows) {
  if (!comparisonRows || !comparisonRows.length) return null;

  const data = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, "Skill Area")
    .addColumn(Charts.ColumnType.NUMBER, "This Week")
    .addColumn(Charts.ColumnType.NUMBER, "Last Week");

  comparisonRows.forEach((item) => {
    data.addRow([
      item.skill,
      item.currentAccuracy,
      item.previousAccuracy
    ]);
  });

  const chart = Charts.newColumnChart()
    .setDataTable(data.build())
    .setTitle("Weekly Accuracy by Skill Area")
    .setDimensions(760, 420)
    .setLegendPosition(Charts.Position.RIGHT)
    .setXAxisTitle("Skill Area")
    .setYAxisTitle("Accuracy (%)")
    .setOption("vAxis", {
      viewWindow: { min: 0, max: 100 },
      ticks: [0, 25, 50, 75, 100]
    })
    .setOption("chartArea", {
      left: 70,
      top: 55,
      width: "68%",
      height: "70%"
    })
    .setOption("backgroundColor", "#ffffff")
    .setOption("colors", ["#247c6d", "#a8b8b2"])
    .build();

  return chart.getAs("image/png").setName("weekly-skill-accuracy.png");
}

function buildWeeklySkillChartSectionHtml_(comparisonRows, hasSkillChart) {
  if (!comparisonRows || !comparisonRows.length) {
    return `
      <p style="margin:0;color:#52635d;line-height:1.6;">
        No learning-game accuracy data is available for the last two weeks yet.
      </p>
    `;
  }

  const legend = `
    <div style="margin-bottom:14px;font-size:13px;color:#52635d;">
      <span style="display:inline-block;width:11px;height:11px;background:#247c6d;border-radius:2px;margin-right:5px;"></span>
      This week
      <span style="display:inline-block;width:11px;height:11px;background:#a8b8b2;border-radius:2px;margin:0 5px 0 16px;"></span>
      Last week
    </div>
  `;

  if (!hasSkillChart) {
    return legend + buildWeeklySkillComparisonFallbackHtml_(comparisonRows);
  }

  return `
    ${legend}
    <div style="text-align:center;">
      <img src="cid:weeklySkillChart"
           alt="Bar chart comparing this week's and last week's accuracy by skill area."
           style="display:block;width:100%;max-width:760px;height:auto;margin:0 auto;border:0;">
    </div>
    <div style="margin-top:12px;font-size:12px;color:#6c7b76;line-height:1.5;">
      Accuracy is shown only for skills practised during either of the last two 7-day periods.
    </div>
  `;
}

function buildWeeklySkillComparisonFallbackHtml_(comparisonRows) {
  return comparisonRows.map((item) => `
    <div style="padding:9px 0;border-bottom:1px solid #edf2f0;">
      <strong style="display:block;color:#26332f;">${escapeWeeklyAdventureHtml_(item.skill)}</strong>
      <span style="font-size:13px;color:#52635d;">
        This week ${item.currentAccuracy}% · Last week ${item.previousAccuracy}%
      </span>
    </div>
  `).join("");
}

function buildWeeklySkillComparisonPlainText_(comparisonRows) {
  if (!comparisonRows || !comparisonRows.length) {
    return ["- No skill accuracy data is available for the last two weeks yet."];
  }

  return comparisonRows.map((item) =>
    `- ${item.skill}: This week ${item.currentAccuracy}% | Last week ${item.previousAccuracy}%`
  );
}

function escapeWeeklyAdventureHtml_(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
