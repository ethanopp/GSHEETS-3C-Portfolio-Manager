// /** Excel inserting functions 
//  * Courtesy to @the_okayest_human
//  * **/
//  function pushToSheet(sheetName, data) {

//     //console.log(additionalHeaders)
  
//     try {
//       const ss = SpreadsheetApp.getActive().getSheetByName(sheetName);
//       const lastRow = ss.getLastRow()
//       const lastCol = ss.getLastColumn();
  
//       // ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(protection => {
//       //     if (protection.canEdit()) {
//       //         protection.remove();
//       //     }
//       // })
  
//       let output = [];
//       if (lastRow > 0 && lastCol > 0) {
//         // clearing the content of the spreadsheet
//         ss.getRange(2, 1, ss.getLastRow(), ss.getLastColumn()).clearContent();
//       }
//       updateHeaders(sheetName, Object.keys(data[0]))
//       const headers = Object.keys(data[0]);
  
//       if (data.length != 0) {
//         data.forEach(row => {
//           let object = {}
//           // reording the data to match the order of the headers
//           headers.forEach(header => {
//             object[header] = row[header]
//           })
  
//           output.push(Object.values(object))
//         })
  
//         //setting the formatting here causes a bug where it breaks the check boxes.
//         ss.getRange(2, 1, output.length, output[0].length)
//           .setValues(output)
//           .setHorizontalAlignment("center")
//           .protect()
//           .setWarningOnly(true)
  
//         ss.getRange(1, 1, 1, output[0].length)
//           .setFontWeight("bold")
//           .setHorizontalAlignment("center")
//           .protect()
//           .setWarningOnly(true)
//       }
  
//       removeEmptyRows(sheetName);
//       removeEmptyColumns(sheetName);
//       resizeColumns(sheetName);
//       SpreadsheetApp.flush()
//       return "sync successful"
//     } catch (err) {
//       console.log(err);
//       return `sync Failed. Reason - ${err}`
//     }
  
//   }
  
//   function updateHeaders(name, headers) {
//     const spreadsheet = SpreadsheetApp.getActive();
  
//     // this is not a mistake for headers. GAS requires everything to be in an array.
//     let headersArray = [headers]
  
//     // if (additionalHeaders != null) { headersArray = [[...headers, ...additionalHeaders]] }
  
//     let ss = spreadsheet.getSheetByName(name);
//     ss.getRange(1, 1, 1, headersArray[0].length)
//       .setValues(headersArray);
  
//     return headersArray
  
//     // ss.setFrozenRows(1);
//   }
  
//   function resizeColumns(tab) {
//     const ss = SpreadsheetApp.getActive().getSheetByName(tab);
//     var lastColumn = ss.getLastColumn();
//     ss.autoResizeColumns(1, lastColumn);
//   }
  
//   function removeEmptyColumns(tab) {
//     const ss = SpreadsheetApp.getActive().getSheetByName(tab);
//     var maxCols = ss.getMaxColumns();
//     var lastCol = ss.getLastColumn();
  
//     if (maxCols > lastCol) {
//       ss.deleteColumns(lastCol + 1, maxCols - lastCol);
  
//     }
  
//   }
  
  
//   function removeEmptyRows(tab) {
//     const ss = SpreadsheetApp.getActive().getSheetByName(tab);
  
//     // returns all the rows in the sheet as a number
//     const maxRows = ss.getMaxRows();
  
//     // returns the last row in the sheet THAT HAS CONTENT
//     const lastRow = ss.getLastRow();
  
//     console.log(`max Rows: ${maxRows}. Last Row: ${lastRow}. Sheet: ${tab}`)
  
//     // need to delete all by the last row with a buffer.
  
//     if (lastRow === 1 && maxRows === 2) {
//       // do nothing because everything is okay.
//     } else if (lastRow === 1 && maxRows >= 3) {
//       // first row to delete is row 3 (we want to keep 1 as the header, 2 as a buffer)
//       ss.deleteRows(lastRow + 2, maxRows - (lastRow + 1));
//       ss.getRange(2, 1, 1, ss.getLastColumn()).setFontWeight("normal");
//     } else if (maxRows > lastRow) {
//       ss.deleteRows(lastRow + 1, maxRows - lastRow);
//     }
//   }
  
//   /** Helper functions */
  
//   function utcnow() {
//     var d = new Date();
//     return d.getTime() * .001; // Number of ms since Jan 1, 1970
//   }
  
//   function utcnowdate() {
//     return Utilities.formatDate(new Date(), "GMT+0", "MM/dd/yyyy")
//   }
  
  
//   function onEdit(e) {
  
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
  
  
//   function filterAccount() {
//     var accountID = SpreadsheetApp.getActive().getRange("Instructions!B15").getValues()[0][0].toLocaleString().replace(/,/g, "");
//     if (accountID.length > 0) {
//       return "&account_id=" + accountID;
//     } else {
//       return "";
//     }
  
//   }
  
  
//   /** 3C API functions */
  
//   async function get3caccounts() {
//     // Hit api for deals data
//     var apiCall = await query3c("get", "/public/api/ver1/accounts", "");
//     let dataArray = []
//     console.log(apiCall)
  
//     // Load data into new array with only the columns we want and format them
//     apiCall.forEach(row => {
//       let {id, name} = row
//       let tempObject = {
//         id,
//         name
//       }
//       dataArray.push(tempObject);
//     })
  
//     // Insert new array into spreadsheet
//     pushToSheet('Account (raw)', dataArray);
//     return dataArray
  
//   }
  
  
  
//   async function get3cpie() {
//     // Hit api for deals data
  
//     let accountData = await get3caccounts()
//     let dataArray = []
  
//     for (account of accountData) {
//       console.log(account.name)
//       let {id, name} = account
//       var apiCall = await query3c("post", "/public/api/ver1/accounts/" + id + "/account_table_data", "");
  
//       // Load data into new array with only the columns we want and format them
//       for(row of apiCall){
  
//         let {currency_code,percentage, position, btc_value, usd_value } = row
//         let tempObject = {
//           'account_id': id,
//           'account_name' : name,
//           currency_code,
//           'percentage': percentage.toFixed(2),
//           position,
//           btc_value,
//           'usd_value' : usd_value.toFixed(2)
//         }
  
//         dataArray.push(tempObject);
//       }
  
//     }
//     console.log(dataArray)
//     // Insert new array into spreadsheet
//     pushToSheet('Account Balances (raw)', dataArray);
  
//   }
  
  
  
//   function get3cdeals() {
//     // Hit api for deals data
//     var apiCall = query3c("get", "/public/api/ver1/deals", "scope=active&limit=1000")
//     let dataArray = []
  
//     // Load data into new array with only the columns we want and format them
//     apiCall.forEach(row => {
  
//       let { account_id, id, bot_id, max_safety_orders, active_safety_orders_count, created_at, updated_at, closed_at, completed_safety_orders_count, pair, take_profit , base_order_volume, safety_order_volume, safety_order_step_percentage, bought_volume, bought_amount, bought_average, base_order_average_price, sold_amount, sold_volume, sold_average_price, final_profit, profit_currency, martingale_coefficient, martingale_volume_coefficient, martingale_step_coefficient, stop_loss_percentage, from_currency, to_currency, current_price, take_profit_price, stop_loss_price, final_profit_percentage, actual_profit_percentage, bot_name, account_name, usd_final_profit, actual_profit, actual_profit_usd} = row
  
//       let tempObject = {
//         id,
//         bot_id,
//         'max_safety_orders' : +max_safety_orders,
//         account_id,
//         active_safety_orders_count,
//         'created_at (UTC)' : Utilities.formatDate(new Date(created_at), "UTC", "MM-dd-yyyy HH:mm:ss"),
//         'updated_at (UTC)' : Utilities.formatDate(new Date(updated_at), "UTC", "MM-dd-yyyy HH:mm:ss"),
//         'closed_at (UTC)' : (closed_at != null) ? Utilities.formatDate(new Date(closed_at), "UTC", "MM-dd-yyyy HH:mm:ss") : null,
//         completed_safety_orders_count,
//         pair,
//         take_profit,
//         'base_order_volume': +base_order_volume,
//         'safety_order_volume': +safety_order_volume,
//         'safety_order_step_percentage': +safety_order_step_percentage,
//         'bought_amount': +bought_amount,
//         'bought_volume': +bought_volume,
//         'bought_average': +bought_average,
//         'base_order_average_price' : +base_order_average_price,
//         'sold_amount': +sold_amount,
//         'sold_volume': +sold_volume,
//         'sold_average_price': +sold_average_price,
//         'final_profit' : +final_profit,
//         'martingale_coefficient' : +martingale_coefficient,
//         'martingale_volume_coefficient' : +martingale_volume_coefficient,
//         'martingale_step_coefficient' : +martingale_step_coefficient,
//         'stop_loss_percentage': +stop_loss_percentage,
//         profit_currency,
//         from_currency,
//         to_currency,
//         'current_price' : +current_price,
//         'take_profit_price' : +take_profit_price,
//         'stop_loss_price' : +stop_loss_price,
//         'final_profit_percentage': +final_profit_percentage,
//         'actual_profit_percentage' : +actual_profit_percentage,
//         bot_name,
//         account_name,
//         usd_final_profit,
//         actual_profit,
//         actual_profit_usd
//       }
  
//       dataArray.push(tempObject);
//     })
  
//     // Insert new array into spreadsheet
//     pushToSheet('deals (raw)', dataArray);
  
//   }
  
  
//   function query3c(requesttype, endPoint, params, query, options) {
//     var config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Instructions");
//     var apikey = config.getRange('C4').getValue().replace(/\s/g, "");
//     var apisecret = config.getRange('C5').getValue().replace(/\s/g, "");
  
//     var baseUrl = "https://api.3commas.io";
  
//     // var pointParams = "?" + params;
  
//     if (params.length > 0) {
//       var pointParams = "?" + params + "&";
//     } else {
//       var pointParams = "?";
//     }
  
  
//     var queryString = endPoint + pointParams + 'api_key=' + apikey + '&secret=' + apisecret; // Modified
//     var signature = Utilities.computeHmacSha256Signature(queryString, apisecret); // Added
//     signature = signature.map(function (e) {
//       return ("0" + (e < 0 ? e + 256 : e).toString(16)).slice(-2)
//     }).join(""); // Added
  
//     //headers
//     var hparams = {
//       'method': requesttype,
//       'headers': {
//         'APIKEY': apikey,
//         'Signature': signature
//       },
//       'muteHttpExceptions': true
//     };
  
//     return JSON.parse(UrlFetchApp.fetch(baseUrl + queryString, hparams).getContentText());
//   }
  
  
//   function syncExchangeBalanceTo3c() {
//     // Grab all Account IDs
//     var sheet = SpreadsheetApp.getActive().getSheetByName("Account (raw)");
//     var rangeData = sheet.getDataRange();
//     var lastRow = rangeData.getLastRow();
//     if (lastRow > 1) {
//       var searchRange = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
//       // Loop through each ID and hit endpoint to refresh
//       searchRange.forEach(function (row) {
//         //  Logger.log("/ver1/accounts/"+row[0].toLocaleString().replace(/,/g,"")+"/load_balances");
//         query3c("post", "/public/api/ver1/accounts/" + row[0].toLocaleString().replace(/,/g, "") + "/load_balances", "")
//       });
//     }
  
//   }
  
  
//   function loadCurrentRisk() {
//     // Update bankroll 
//     var currentBankroll = SpreadsheetApp.getActive().getRange("Risk Monitor!D4").getValues();
//     var targetBankroll = SpreadsheetApp.getActive().getRange("Risk Planner!A3");
//     targetBankroll.setValues(currentBankroll);
  
//     // Update Deals
//     var sourceValues = SpreadsheetApp.getActive().getRange("Active Deal SO Table!E3:I1003").getValues();
//     var targetRange = SpreadsheetApp.getActive().getRange("Risk Planner!C47:G1047");
//     targetRange.setValues(sourceValues);
//   }
  
  
//   function main() {
//     var dt = new Date();
//     var time_stamp = dt.toLocaleTimeString();
  
//     // Refresh Accounts
//     var accountSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Account (raw)");
//     var cellVal = '=get3caccounts("' + time_stamp + '")';
//     // Sleep for 5 secs to allow accounts to load in
//     // Utilities.sleep(10*1000);
//     accountSheet.getRange('A1').setValue(cellVal);
//     SpreadsheetApp.flush();
  
//     // Refresh Active Deals
//     var dealSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Active Deals (raw)");
//     var cellVal = '=get3cdealsactive("' + time_stamp + '")';
//     dealSheet.getRange('A1').setValue(cellVal);
  
//     // Refresh Completed Deals
//     var dealCompleteSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Complete Deals (raw)");
//     var cellVal = '=get3cdealscomplete("' + time_stamp + '")';
//     dealCompleteSheet.getRange('A1').setValue(cellVal);
  
//     // Sync all exchanges to 3 commas
//     syncExchangeBalanceTo3c()
  
//     // Show refresh time on dashboard
//     SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Risk Monitor").getRange('I3').setValue("Last Refreshed: " + Date(Date.now()).toString())
  
//   }
