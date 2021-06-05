# Permissions

The 3C Risk Manager integration requests multiple permissions through Google Sheets. These permissions are only to fetch data, automate the fetching, and modify your sheet. A description of each permission and purpose is below.

## Connect to an external service
This permission is used to access the 3Commas API. You can find all this code located in the `apiHandler.js` and `3commas.js` files. Only read permission is granted to this integration so no changes can be made on your behalf.

## See, edit, create, and delete your spreadsheets in Google Drive
This one is the largest scope, howver, it's required for the trigger functions. The only time this scope is used is to access this spreadsheet by it's spreadsheet ID and update it. This code is found in the `getDefaultSpreadsheetId()` function. This function takes the script property `activeSpreadsheetID` and accesses the `SpreadsheetApp` to open it by this ID. You will not find any other code to externally access drive.

## Display and run third-party web content in prompts and sidebars inside Google applications
Sidebars and prompts are how the integration engages with you and displays data within Sheets. You can find the sidebar code in the `/sidebar` folder. This had no trackers or external services within the code itself.

Prompts can be found in the `generalFunctions.js` and these are exclusively used to notify you when the sheet is active.

## Allow this application to run when you are not present
This is the automation and trigger settings. These are managed in the syncSettings.js file. When you create a trigger and authorize this scope it will allow the script to run without you present every dat at 3:45am.