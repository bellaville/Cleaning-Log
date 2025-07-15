/*function onOpen(){
  SpreadsheetApp.getUi()
    .createMenu('Custom Tools')
    .addItem('initializeDB', 'initializeDatabase')
    .addToUi();
}
*/

const SHEET_NAMES = {
  CLEANING_REPORT_LOG:'Cleaning Report Log',
  LAST_COMPLETION_DATES: 'LastCompletionDates',
  BUILDINGS: 'Buildings',
  ROOM_TYPES: 'RoomTypes',
  ROOMS: 'Rooms',
  TASKS: 'Tasks',
  ROOM_TYPE_TASKS: 'RoomTypeTasks',
  CLEANING_EVENTS: 'CleaningEvents',
  TASK_COMPLETIONS: 'TaskCompletions'
};



/**
 * Initialize the database sheets with headers
 */
function initializeDatabase() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID); //replace with appropriate id

  // Create Cleaning Report Log Sheet
  const logSheet = getOrCreateSheet(ss, SHEET_NAMES.CLEANING_REPORT_LOG);
  logSheet.getRange(1, 1, 1, 10).setValues([['Name', 'Building', 'Room', 'Date', 'Time', 'Timestamp', 'Task', 'Comments', 'Department', 'User Email address']]);

  // Create Last Completion Dates sheet
  const lastSheet = getOrCreateSheet(ss, SHEET_NAMES.LAST_COMPLETION_DATES);

  // Create Buildings sheet
  const buildingsSheet = getOrCreateSheet(ss, SHEET_NAMES.BUILDINGS);
  buildingsSheet.getRange(1, 1, 1, 3).setValues([['building_id', 'building_name', 'created_date']]);
  
  // Create Room Types sheet
  const roomTypesSheet = getOrCreateSheet(ss, SHEET_NAMES.ROOM_TYPES);
  roomTypesSheet.getRange(1, 1, 1, 3).setValues([['room_type_id', 'room_type_name', 'description']]);
  
  // Create Rooms sheet
  const roomsSheet = getOrCreateSheet(ss, SHEET_NAMES.ROOMS);
  roomsSheet.getRange(1, 1, 1, 5).setValues([['room_id', 'room_name', 'building_id', 'room_type_id', 'is_active']]);
  
  // Create Tasks sheet
  const tasksSheet = getOrCreateSheet(ss, SHEET_NAMES.TASKS);
  tasksSheet.getRange(1, 1, 1, 5).setValues([['task_id', 'task_title', 'task_description', 'frequency_days', 'is_active']]);
  
  // Create Room Type Tasks sheet
  const roomTypeTasksSheet = getOrCreateSheet(ss, SHEET_NAMES.ROOM_TYPE_TASKS);
  roomTypeTasksSheet.getRange(1, 1, 1, 3).setValues([['room_type_id', 'task_id', 'is_required']]);
  
  // Create Cleaning Events sheet
  const cleaningEventsSheet = getOrCreateSheet(ss, SHEET_NAMES.CLEANING_EVENTS);
  cleaningEventsSheet.getRange(1, 1, 1, 7).setValues([['event_id', 'employee_name', 'room_id', 'event_date', 'timestamp', 'comments', 'is_completed']]);
  
  // Create Task Completions sheet
  const taskCompletionsSheet = getOrCreateSheet(ss, SHEET_NAMES.TASK_COMPLETIONS);
  taskCompletionsSheet.getRange(1, 1, 1, 8).setValues([['completion_id', 'event_id', 'task_id', 'room_id', 'completed_date', 'completed_time', 'notes', 'is_completed']]);
  
  console.log('Database initialized successfully');
}

/**
 * Helper function to get or create a sheet
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}
