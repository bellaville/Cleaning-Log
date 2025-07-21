/**
 * Backend.gs is the main google script code for the Cleaning Report Form user interface for Growtown. It serves as the
 * 'backend' code for the application. It reads and writes data from the CLEANING LOG google sheet.
 * The following is included in this script:
 * 
 * - the entry point for the application (doGet)
 * - the function to submit cleaning entries (submitCleaningReport)
 * - data retrieval methods to pull from the database for use in the user interface:
 * 
 * See function descriptions for more detailed explanation
 */



/**
 * Helper funtcion to get the spreadsheet when needed.
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById('insert id');
}

/**
 * Helper function to get all sheets associated with the main spreadsheet file.
 */
function getSheets() {
  const ss = getSpreadsheet();
  return {
    CLEANING_REPORT_LOG: ss.getSheetByName('Cleaning Report Log'),
    BUILDINGS: ss.getSheetByName('Buildings'),
    ROOM_TYPES: ss.getSheetByName('RoomTypes'),
    ROOMS: ss.getSheetByName('Rooms'),
    TASKS: ss.getSheetByName('Tasks'),
    ROOM_TYPE_TASKS: ss.getSheetByName('RoomTypeTasks'),
    CLEANING_EVENTS: ss.getSheetByName('CleaningEvents'),
    TASK_COMPLETIONS: ss.getSheetByName('TaskCompletions'),
    LAST_COMPLETION_DATES: ss.getSheetByName('LastCompletionDates')
  };
}

/**
 * Retrieves the data form files with the name specified
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}


/**
 * Entry point for the application. Retrieves and serves CleaningReport.html
 */
function doGet() {

  const userEmail = Session.getActiveUser().getEmail();
  console.log("User Email: " + userEmail);

  var html = HtmlService.createTemplateFromFile('CleaningReport')

  var evaluated = html.evaluate();
  evaluated.addMetaTag('viewport', 'width=device-width, initial-scale=1');
  return evaluated;
  
}

/**
 * generateSafeId generates a unique id based on the uid. Adds the prefix to the start of the string.
 */
function generateSafeId(prefix){
  return `${prefix}-${Utilities.getUuid()}`; 
}

/**
 * submitCleaningReport adds new entries to cleaning log. It submits one entry per cleaning task selected
 */
function submitCleaningReport(data) {

  const userEmail = Session.getActiveUser().getEmail();

  const SHEETS = getSheets();

  const timestamp = new Date(); // get current time to keep record
  console.log(timestamp);
  const cleaningEventId = generateSafeId("CE");

  const reportLogRows = [];
  const taskCompletionsRows = [];

  data.tasks.forEach(task => {
    // Build rows for batch writing later
    reportLogRows.push([
      data.name,
      data.building,
      data.room,
      data.date,
      data.time,
      timestamp,
      task.taskName,
      data.comments,
      data.department,
      userEmail
    ]);

    const taskUniqueId = generateSafeId("T");
    taskCompletionsRows.push([
      taskUniqueId,
      cleaningEventId,
      task.taskId,
      data.roomId,
      data.date,
      data.time,
      data.comments,
      true
    ]);
  });

  // Batch write: Cleaning Report Log
  const logSheet = SHEETS.CLEANING_REPORT_LOG;
  logSheet.getRange(logSheet.getLastRow() + 1, 1, reportLogRows.length, reportLogRows[0].length)
         .setValues(reportLogRows);

  // Single write: Cleaning Event Table
  SHEETS.CLEANING_EVENTS.appendRow([
    cleaningEventId,
    data.name,
    data.roomId,
    data.date,
    timestamp,
    data.comments,
    true
  ]);

  // Batch write: Task Completions
  const taskSheet = SHEETS.TASK_COMPLETIONS;
  taskSheet.getRange(taskSheet.getLastRow() + 1, 1, taskCompletionsRows.length, taskCompletionsRows[0].length)
           .setValues(taskCompletionsRows);

  console.log("report log rows: " + reportLogRows);
  console.log("task completions rows: " + taskCompletionsRows);

  return "Entry submitted successfully!";
}

/**
 * getBuildingOptions retrieves all current building, room, and task info from the associated tables.
 */
function getBuildingOptions() {

  const SHEETS = getSheets();
  
  // Get data from Buildings sheet
  const buildingsData = SHEETS.BUILDINGS.getDataRange().getValues();
  const buildingIdToName = {};

  // Skip header and populate ID -> Name mapping
  for (let i = 1; i < buildingsData.length; i++) {
    const [buildingId, buildingName, createdDate] = buildingsData[i];
    if (buildingId !== undefined && buildingName) {
      buildingIdToName[buildingId] = buildingName;
    }
  }

  // Get data from Rooms sheet
  const roomsData = SHEETS.ROOMS.getDataRange().getValues();

  // Get data associated with tasks
  const completionDateData = SHEETS.LAST_COMPLETION_DATES.getDataRange().getValues();
  const roomTypeTasksData = SHEETS.ROOM_TYPE_TASKS.getDataRange().getValues();
  const taskData = SHEETS.TASKS.getDataRange().getValues();

  // Skip header and group rooms under building name
  const options = {};
  for (let i = 1; i < roomsData.length; i++) {
    const [roomId, roomName, buildingId, roomTypeId, isActive] = roomsData[i];
    const buildingName = buildingIdToName[buildingId];

    // Only include active rooms
    if (roomName && buildingName && isActive === true) {
      if (!options[buildingName]) {
        options[buildingName] = {};
      }
    
      let tasks = getTasksByRoomType(roomTypeId, roomId, roomTypeTasksData, taskData, completionDateData);
      options[buildingName][roomName] = {roomId: roomId, roomTypeId: roomTypeId, roomTasks: tasks};
    }
    
  }
  return options;
}

/**
 * Returns a list of task objects based on the room type id. Orders tasks by frequency (most frequent first, least frequent last).
 * Also retrieves last cleaning date for each task based on the room id.
 * @param id - the id of the room type for which the tasks pertain to
 * @param roomId - the id of the room 
 */
function getTasksByRoomType(id, roomId, roomTypeTasksData, tasksData, completionDateData){

  // if room type isn't set return an empty list
  if(id === ""){
    console.log("room type not set for room id: " + roomId);
    return [];
  }

  try{
    // get the task ids based on room type
    const taskIds = [];
      for (let i = 1; i < roomTypeTasksData.length; i++) {
        const [rTypeId, taskId, isRequired] = roomTypeTasksData[i];
        if (rTypeId == id && isRequired === true) {
          taskIds.push(taskId);
        }
      }

      const tasks = [];
      for (let i = 1; i < tasksData.length; i++) {
        const [taskId, taskTitle, taskDescription, frequencyDays, isActive] = tasksData[i];
        if (taskIds.includes(taskId) && isActive === true) {
          const lastCompletionDate = getCompletionDate(roomId, taskId, completionDateData);
          // add task to task list
          tasks.push(
            {
              taskId: taskId,
              taskTitle: taskTitle,
              taskDescription: taskDescription,
              frequencyDays: frequencyDays,
              lastCompletionDate: lastCompletionDate
            }
          );
        }

      }

      tasks.sort((a, b) => a.frequencyDays - b.frequencyDays); // sort tasks by frequency
      return tasks;

  }catch(error){
    console.error('Error getting tasks for room', error);
    return [];
  }

}

/**
 * Gets the most recent completion date of task taskId in room roomId based on the passed completionData. This uses
 * the LastCompletionDates sheet which includes all this data for each room.
 */
function getCompletionDate(roomId, taskId, completionDateData){
  const matchingRow = completionDateData.find(row => row[0] == roomId && row[1] == taskId);
  if (matchingRow === undefined) { // there is no record of this task being completed in this room
    return "Never";
  } else {
    return matchingRow[2].toDateString(); // return the associated date
  }
}
