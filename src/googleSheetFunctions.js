/************************************************
 *
 *           Write Sheet functions
 *
 ************************************************/
function pushToSheet(sheetName, data) {

  try {
    const ss = SpreadsheetApp.getActive().getSheetByName(sheetName);
    const lastRow = ss.getLastRow()
    const lastCol = ss.getLastColumn();

    ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(protection => {
      if (protection.canEdit()) {
        protection.remove();
      }
    })

    let output = [];
    if (lastRow > 0 && lastCol > 0) {
      // clearing the content of the spreadsheet
      ss.getRange(2, 1, ss.getLastRow(), ss.getLastColumn()).clearContent();
    }
    updateHeaders(sheetName, Object.keys(data[0]))
    const headers = Object.keys(data[0]);

    if (data.length != 0) {
      data.forEach(row => {
        let object = {}
        // reording the data to match the order of the headers
        headers.forEach(header => {
          object[header] = row[header]
        })

        output.push(Object.values(object))
      })

      //setting the formatting here causes a bug where it breaks the check boxes.
      ss.getRange(2, 1, output.length, output[0].length)
        .setValues(output)
        .setHorizontalAlignment("center")
        .protect()
        .setWarningOnly(true)

      ss.getRange(1, 1, 1, output[0].length)
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .protect()
        .setWarningOnly(true)
    }

    removeEmptyRows(sheetName);
    removeEmptyColumns(sheetName);
    resizeColumns(sheetName);
    SpreadsheetApp.flush()
    return "sync successful"
  } catch (err) {
    console.log(err);
    return `sync Failed. Reason - ${err}`
  }

}

function updateHeaders(name, headers) {
  const spreadsheet = SpreadsheetApp.getActive();

  // this is not a mistake for headers. GAS requires everything to be in an array.
  let headersArray = [headers]

  // if (additionalHeaders != null) { headersArray = [[...headers, ...additionalHeaders]] }

  let ss = spreadsheet.getSheetByName(name);
  ss.getRange(1, 1, 1, headersArray[0].length)
    .setValues(headersArray);

  return headersArray

  // ss.setFrozenRows(1);
}

function resizeColumns(tab) {
  const ss = SpreadsheetApp.getActive().getSheetByName(tab);
  var lastColumn = ss.getLastColumn();
  ss.autoResizeColumns(1, lastColumn);
}

function removeEmptyColumns(tab) {
  const ss = SpreadsheetApp.getActive().getSheetByName(tab);
  var maxCols = ss.getMaxColumns();
  var lastCol = ss.getLastColumn();

  if (maxCols > lastCol) {
    ss.deleteColumns(lastCol + 1, maxCols - lastCol);

  }

}

function removeEmptyRows(tab) {
  const ss = SpreadsheetApp.getActive().getSheetByName(tab);

  // returns all the rows in the sheet as a number
  const maxRows = ss.getMaxRows();

  // returns the last row in the sheet THAT HAS CONTENT
  const lastRow = ss.getLastRow();

  console.log(`max Rows: ${maxRows}. Last Row: ${lastRow}. Sheet: ${tab}`)

  // need to delete all by the last row with a buffer.

  if (lastRow === 1 && maxRows === 2) {
    // do nothing because everything is okay.
  } else if (lastRow === 1 && maxRows >= 3) {
    // first row to delete is row 3 (we want to keep 1 as the header, 2 as a buffer)
    ss.deleteRows(lastRow + 2, maxRows - (lastRow + 1));
    ss.getRange(2, 1, 1, ss.getLastColumn()).setFontWeight("normal");
  } else if (maxRows > lastRow) {
    ss.deleteRows(lastRow + 1, maxRows - lastRow);
  }
}

/************************************************
 *
 *           Get Sheet functions
 *
 ************************************************/

function getSheetHeaders(name) {
  const spreadsheet = getDefaultSpreadsheetId();
  let ss = spreadsheet.getSheetByName(name);
  let lastCol = ss.getLastColumn();

  // this assumes your sheet headers are all stores in the first row of your spreadsheet.
  let sheetHeaders = ss.getRange(1, 1, 1, lastCol).getValues();
  return sheetHeaders[0];
}

function getSpreadsheetDataByName(tabName) {
  /** 
   * @param {string} tabName - This is the tab name from the tabNamesReturn() function.
   * @description - Used to fetch the sheet data directly from the spreadsheet. 
   */

  const ss = SpreadsheetApp.getActive().getSheetByName(tabName);
  let lastRow = ss.getLastRow();
  let lastCol = ss.getDataRange().getLastColumn();

  if (lastRow > 1) {
    getSheetHeaders = (tabName) => {
      let ss = SpreadsheetApp.getActive().getSheetByName(tabName);
      let lastCol = ss.getLastColumn();

      // this assumes your sheet headers are all stores in the first row of your spreadsheet.
      let sheetHeaders = ss.getRange(1, 1, 1, lastCol).getValues();
      return sheetHeaders[0];
    };

    let headers = getSheetHeaders(tabName)

    let output = [];
    let spreadsheetData = ss.getRange(2, 1, lastRow - 1, lastCol).getValues();

    // turning each cell into a key / value on an object for that row.
    spreadsheetData.forEach(row => {
      let object = {}
      row.map((cell, index) => {
        object[headers[index]] = cell
      })
      output.push(object)
    })
    SpreadsheetApp.flush();

    return output;
  } else {
    return [];
  }


}


/************************************************
 *
 *           3Commas Google Sheet Functions
 *
 ************************************************/

async function onEdit(e) {
  const SHEETS = {
    'Risk Monitor': {
      'name': 'Risk Monitor',
      'currency_cell': 'F2',
      'account_cell': 'E2'
    },
    'Performance Monitor': {
      'name': 'Performance Monitor',
      'currency_cell': 'F2',
      'account_cell': 'E2'
    },
    'Risk Planner': {
      'name': 'Risk Planner',
      'currency_cell': 'B2',
      'account_cell': 'A2'
    }
  }


  // grab changes from active sheet
  let sheet = e.range.getSheet();
  let currentSheetName = sheet.getName();
  let dropdownPages = ['Risk Monitor', 'Performance Monitor', 'Risk Planner']
  console.log(currentSheetName)

  if (dropdownPages.includes(currentSheetName)) {
    let accountElementCell = SHEETS[currentSheetName].account_cell;
    let currencyElementCell = SHEETS[currentSheetName].currency_cell;

    let account = SpreadsheetApp.getActiveSheet().getRange(accountElementCell).getValue();
    let currency = SpreadsheetApp.getActiveSheet().getRange(currencyElementCell).getValue();


    dropdownPages.filter(page => page !== currentSheetName)

    dropdownPages.forEach(tab => {
      let accountKey = SHEETS[tab].account_cell
      let currencyKey = SHEETS[tab].currency_cell
      console.log(tab)

      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS[tab].name).getRange(accountKey).setValue(account);
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS[tab].name).getRange(currencyKey).setValue(currency);

    })

    let scriptParamsUpdate = (account, currency) => {
      let InstructionPage = {
        'name': 'Instructions',
        'params_start': 'K2:K4'

      }
      let accountData = JSON.parse(getScriptProperty('account_data'))
      let accountID = "All"
      if (account != "All") {
        accountID = accountData.find(e => e.name === account)
        accountID = accountID.id
      }
      console.log(accountID)

      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(InstructionPage.name).getRange(InstructionPage.params_start).setValues([[currency], [accountID], [account]]);

      setScriptProperty('account_name', account)
      setScriptProperty('currency', currency)
      setScriptProperty('account_id', accountID[id].toString())

      SpreadsheetApp.flush();

    }
    scriptParamsUpdate(account, currency)





  }

}


/**
 * Populates the risk planner tab.
 *
 * @return Populates the risk planner tab.
 *
 */
function loadCurrentRisk() {
  let botTab = tabs().bot_tab

  // Update bankroll 
  var currentBankroll = +SpreadsheetApp.getActive().getSheetByName('Risk Monitor').getRange("D4").getValue();
  var targetBankroll = SpreadsheetApp.getActive().getSheetByName('Risk Planner').getRange("A6");
  targetBankroll.setValue(currentBankroll);

  const currency = SpreadsheetApp.getActive().getSheetByName('Risk Planner').getRange("B2").getValue();
  const accountID = SpreadsheetApp.getActive().getSheetByName('Risk Monitor').getRange("E3").getValue();


  var targetRange = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Risk Planner')

  targetRange.getRange(50, 3, 1000, 7).clear()

  console.log({
    accountID
  })
  let botData = getSpreadsheetDataByName(botTab)
    .filter(bot => {
      if (bot.from_currency == currency) {
        return true
      }
    })

  if (accountID != '') {
    botData.filter(bot => bot.account_id == accountID)
  }

  let dataArray = [];

  if (botData != [] && botData.length > 0) {
    botData.forEach(bot => {
      dataArray.push([
        bot.is_enabled,
        bot.name,
        bot.max_active_deals,
        bot.max_safety_orders,
        bot.martingale_volume_coefficient,
        bot.base_order_volume,
        bot.safety_order_volume
      ])
    })

    //return dataArray




    targetRange.getRange(50, 3, dataArray.length, dataArray[0].length)
      .setValues(dataArray)
      .setHorizontalAlignment("center")
  }
}

function updateCharts() {
  var ss = getDefaultSpreadsheetId();
  var sheet = ss.getSheetByName('Risk Monitor')

  // This code is going to loop through all the charts and change them to
  // column charts
  var chart = sheet.getCharts()

  console.log(chart[0].getChartId())
  console.log(chart[0].getNumHeaders())
}



/************************************************
 *
 *           Custom Google Sheet functions
 *
 ************************************************/


/**
 * Returns today's date in UTC
 *
 * @return Returns today's date in UTC
 * @customfunction
 */
function utc_today() {
  return Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd")
}
/** 
* getScriptProperties
*
* @return Returns script properties
* @param {string} property
* @customfunction
*/
function script_properties(property) {
  let scriptProperty = getScriptProperty(property)
  console.log(scriptProperty)
  return scriptProperty
}