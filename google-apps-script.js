const FAMILY_CODE = "CHANGE_THIS_TO_A_PRIVATE_CODE";
const SHEET_NAME = "Daily Adventure Log";

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
    payload.answer || ""
  ]);

  return ContentService.createTextOutput("OK");
}

function getLogSheet_() {
  const spreadsheet = SpreadsheetApp.getActive();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
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
      "Answer"
    ]);
    sheet.getRange(1, 1, 1, 11).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  return sheet;
}
