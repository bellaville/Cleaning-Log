/**
 * This function creates a backup of the 'Cleaning Report Log' tab and adds it to a specified 
 * destination1 Google Sheet. It also creates backups of the 'CleaningEvents' and 'TaskCompletions' tabs and adds 
 * them to a specified destination2 Google Sheet.
 * 
 * This function can be used to create a trigger so it can be automatically
 * executed on a regular basis. 
 */
function createBackupTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var destination1 = SpreadsheetApp.openById("insert id");
  var destination2 = SpreadsheetApp.openById("insert id");

  var mainLog = ss.getSheetByName("Cleaning Report Log");
  var events = ss.getSheetByName("CleaningEvents");
  var tasks = ss.getSheetByName("TaskCompletions");

  var date = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");

  mainLog.copyTo(destination1).setName("BACKUP: " + date);
  events.copyTo(destination2).setName("EVENT-BACKUP: " + date);
  tasks.copyTo(destination2).setName("TASKS-BACKUP: " + date);
  
}
