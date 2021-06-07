/************************************************
 * 
 * Syncing Triggers
 * 
 ************************************************/

 function addTriggers() {
    removeAllTriggers();
    dailySyncAdd();
}

function removeAllTriggers() {
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger(allTriggers[i]);
    }
}

function dailySyncAdd() {
    //creating a trigger to run at noon
    ScriptApp.newTrigger("updateSheet")
        .timeBased()
        .atHour(3)
        .nearMinute(45)
        .everyDays(1)
        .create();
}

async function updateSheet(){

    // TODO - add error handling here for each to finish successful
    await syncExchangeBalanceTo3c()
    await get3cdeals()
    await get3cpie()
    await get3cBots()
    console.log('updated all data.')
}

