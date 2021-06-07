/******************************************
* 
*        Updating Script Properties
*
********************************************/

function setScriptProperty(property, propertyValue) {

    /**
     * Used to set the user properties.
     *
     * @param {string} property - a string containing the name of the property you wish to set. This is case sensitive.
     * @param {string} propertyValue - a string that contains the user property value. This only accepts strings, not booleans.
     */

    var setScriptProperty = PropertiesService.getScriptProperties();
    setScriptProperty.setProperty(property, propertyValue);
    console.log(property, '----', getScriptProperty(property));
}

function getScriptProperty(property) {
    /**
     * Used to fetch the user properties.
     *
     * @param {string} property - a string containing the name of the property you wish to set. This is case sensitive.
     * @returns {string} - The value that is set for the user propery. 
     */

    var returnScriptProperty = PropertiesService.getScriptProperties().getProperty(property);
    return returnScriptProperty;

}

function deleteAllScriptProperties() {
    // Deletes all user properties.
    var userProperties = PropertiesService.getScriptProperties();
    userProperties.deleteAllProperties();
}


/******************************************
* 
*        Spreadsheet Properties
*
********************************************/


 function setActiveSpreadsheetID() {
/**
 * @description fetching the active sheetID and setting it as a property. This is called during the OAuth Auth flow.
 */
    const activeSpreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
    setScriptProperty("activeSpreadsheetID", activeSpreadsheetID);
}


function getDefaultSpreadsheetId() {
/**
 * @description fetching the active sheetID and setting it as a property. This is called during the OAuth Auth flow.
 * @returns {string} - returns the full value for openign the spreadsheet by ID
 */
    let spreadsheetID = getScriptProperty("activeSpreadsheetID");
    let spreadsheet = SpreadsheetApp.openById(spreadsheetID);
    return spreadsheet;
}


/******************************************
* 
*        Tab Information
*
********************************************/

function tabs(){

    return {
        'bot_tab' : 'Raw - Bot Data',
        'deal_tab': 'deals (raw)',
        'account_balances_tab' : 'Account Balances (raw)'
    }


}