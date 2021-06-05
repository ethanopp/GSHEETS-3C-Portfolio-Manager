// function onEdit(e) {

//     var sh = e.range.getSheet();
//     // link account filter dropdowns
//     if (sh.getName() == 'Risk Monitor') {
  
//       if (e.range.getA1Notation() == 'F2') {
//         var account = SpreadsheetApp.getActiveSheet().getRange("Risk Monitor!F2").getValue();
//         SpreadsheetApp.getActiveSheet().getRange("Instructions!A18").setValue(account);
//       } else if (e.range.getA1Notation() == 'E2') {
//         var account = SpreadsheetApp.getActiveSheet().getRange("Risk Monitor!E2").getValue();
//         SpreadsheetApp.getActiveSheet().getRange("Instructions!A15").setValue(account);
  
//       }
  
  
//     } else if (sh.getName() == 'Instructions') {
  
//       if (e.range.getA1Notation() == 'A18') {
//         var account = SpreadsheetApp.getActiveSheet().getRange("Instructions!A18").getValue();
//         SpreadsheetApp.getActiveSheet().getRange("Risk Monitor!F2").setValue(account);
  
//       } else if (e.range.getA1Notation() == 'A15') {
//         var account = SpreadsheetApp.getActiveSheet().getRange("Instructions!A15").getValue();
//         SpreadsheetApp.getActiveSheet().getRange("Risk Monitor!E2").setValue(account);
//         // main();
//       }
  
//     }
//   }

/************************************************
*
*           Write Sheet functions
*
 ************************************************/

function pushToSheet(sheetName, data) {

    //console.log(additionalHeaders)

    try {
        const ss = SpreadsheetApp.getActive().getSheetByName(sheetName);
        const lastRow = ss.getLastRow()
        const lastCol = ss.getLastColumn();

        // ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(protection => {
        //     if (protection.canEdit()) {
        //         protection.remove();
        //     }
        // })

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
*           3Commas Google Sheet Functions
*
 ************************************************/

function filterAccount() {
    var accountID = SpreadsheetApp.getActive().getRange("Instructions!B15").getValues()[0][0].toLocaleString().replace(/,/g, "");
    if (accountID.length > 0) {
        return "&account_id=" + accountID;
    } else {
        return "";
    }

}

function loadCurrentRisk() {
    // Update bankroll 
    var currentBankroll = SpreadsheetApp.getActive().getRange("Risk Monitor!D4").getValues();
    var targetBankroll = SpreadsheetApp.getActive().getRange("Risk Planner!A3");
    targetBankroll.setValues(currentBankroll);

    // Update Deals
    var sourceValues = SpreadsheetApp.getActive().getRange("Active Deal SO Table!G3:K1003").getValues();
    var targetRange = SpreadsheetApp.getActive().getRange("Risk Planner!C47:G1047");
    targetRange.setValues(sourceValues);
}

function main() {
    var dt = new Date();
    var time_stamp = dt.toLocaleTimeString();

    // Refresh Accounts
    var accountSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Account (raw)");
    var cellVal = '=get3caccounts("' + time_stamp + '")';
    // Sleep for 5 secs to allow accounts to load in
    // Utilities.sleep(10*1000);
    accountSheet.getRange('A1').setValue(cellVal);
    SpreadsheetApp.flush();

    // Refresh Active Deals
    var dealSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Active Deals (raw)");
    var cellVal = '=get3cdealsactive("' + time_stamp + '")';
    dealSheet.getRange('A1').setValue(cellVal);

    // Refresh Completed Deals
    var dealCompleteSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Complete Deals (raw)");
    var cellVal = '=get3cdealscomplete("' + time_stamp + '")';
    dealCompleteSheet.getRange('A1').setValue(cellVal);

    // Sync all exchanges to 3 commas
    syncExchangeBalanceTo3c()

    // Show refresh time on dashboard
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Risk Monitor").getRange('I3').setValue("Last Refreshed: " + Date(Date.now()).toString())

}