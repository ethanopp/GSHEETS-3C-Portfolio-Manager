/************************************************
 * 
 * Syncing Triggers
 * 
 ************************************************/

function addTriggers() {
    console.info('Added triggers')
    removeAllTriggers();
    dailySyncAdd();
}

function removeAllTriggers() {
    console.info('Removed triggers')

    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger(allTriggers[i]);
    }
}

function dailySyncAdd() {
    //creating a trigger to run every 3 hours
    ScriptApp.newTrigger("updateSheet")
        .timeBased()
        .everyHours(2)
        .create();
}

function updateUTC() {
    const spreadsheet = getDefaultSpreadsheetId();
    spreadsheet.getSheetByName('Instructions').getRange('K1').setValue(utc_today());
}

async function updateSheet() {

    updateUTC()

    // TODO - add error handling here for each to finish successful
    await syncExchangeBalanceTo3c()
    await get3cdeals()
    await get3cpie()
    await get3cBots()



    console.log('updated all data.')
}

