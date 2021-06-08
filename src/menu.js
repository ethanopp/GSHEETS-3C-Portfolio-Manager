function onInstall(e) {
    /**
     * The document is already open, so after installation is complete
     * the ˙onOpen()` trigger must be called manually in order for the
     * add-on to execute.
     */
    onOpen(e);

}

// add custom menu
function onOpen(e) {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('3C Portfolio Manager')
        .addItem('Sidebar', 'showSidebar')
        .addItem('Update Data', 'sidebar_updateSheet')
        .addSubMenu(ui.createMenu('Automation Settings')
            .addItem('Enable Automation', 'dailySyncAdd')
            .addItem('Disable Automation', 'removeAllTriggers'))

        .addToUi();
}

async function sidebar_updateSheet(){
    await updateSheet()
    sheetsUiMessage('Complete!', 'Finished updating deals and accounts!')
}

function toggleAutomationOn(){
    try{
        addTriggers()
    } catch(error){
        console.log(error)
        throw error
    }

    return setScriptProperty("automations_enabled", 'true'); 


}

function toggleAutomationOff(){
    try{
        removeAllTriggers()
    } catch(error){
        console.log(error)
        throw error
    }
    return setScriptProperty("automations_enabled", 'false'); 


    
}

function toggleAutomationStatus(){
    return getScriptProperty('automations_enabled')
}

async function showSidebar() {
    await setActiveSpreadsheetID();
    const html = HtmlService.createTemplateFromFile('sidebar/sidebar');
    
    const page = html.evaluate();
    page.setTitle("Savvy Tool Belt");
    SpreadsheetApp.getUi().showSidebar(page);
  
  
  }

async function sidebar_get3cdeals() {
    await get3cdeals();
    sheetsUiMessage('Complete!', 'Finished updating 3Commas deals.')
}

async function sidebar_get3cpie() {
    await get3cpie();
    sheetsUiMessage('Complete!', 'Finished updating 3Commas account data.')
}

// async function sidebar_syncExchangeBalanceTo3c() {
//     await syncExchangeBalanceTo3c();
//     sheetsUiMessage('Complete!', 'Finished syncing your exchange balance to 3Commas')
// }



  function updateApiKeys(api_keys){

        console.log(api_keys)
      
        setScriptProperty('api_id', api_keys.api_id)
        setScriptProperty('api_secret', api_keys.api_secret)
    
}

