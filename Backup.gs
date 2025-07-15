/**
 * This function creates a backup of the 'Cleaning Report Log' tab and adds it to a specified 
 * destination Google Sheet. This function can be used to create a trigger so it can be automatically
 * executed on a regular basis. 
 */
function createBackupTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var destination = SpreadsheetApp.openById("Insert destination spreadsheet id here");

  var weekly = ss.getSheetByName("Cleaning Report Log");
  var date = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");

  weekly.copyTo(destination).setName("BACKUP: " + date);
}
