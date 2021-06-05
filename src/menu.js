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
    ui.createMenu('3c - Risk Manager')
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



  function updateApiKeys(api_keys){

        console.log(api_keys)
      
        setScriptProperty('api_id', api_keys.api_id)
        setScriptProperty('api_secret', api_keys.api_secret)
    
}

async function sidebar_deleteApiKeys(){
        let response = await sheetsUiConfirmation('Confirm', 'Are you sure? Pressing "YES" will delete the API keys from Script properties. This means you will have to regenerate the keys within 3Commas.')
      
        if (response) {
      
            setScriptProperty('api_id', '')
            setScriptProperty('api_secret', '')
        }
      
    
}
