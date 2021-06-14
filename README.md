**[v6.2 Release](https://docs.google.com/spreadsheets/d/1Lp1uEiOI7zawK9jZTjfL0ZB31JyS7IVZBRekqTfKb68)**

# KNOW ISSUES

- If saving the API keys does not prompt you with a confirmation message, switch to a private browser and do it. Google has a bug in passing data from the front end to backend when you have multiple Google accounts.
- If you have a large number of deals the initial sync can lock up google sheets where you need to refresh.

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


## API Keys
The API keys are stored within Google App Script's Properties. These can be accessed from within Google Sheets by going to Tools > Script Editor > Use Legacy Editor (Top right) > File > Project Properties > Script Properties.

You should not need to access these ever, but they are available to see. If you add new API keys via the sidebar it will overwrite these keys in favor of the new keys.

Lastly, to delete API keys you can use the '3c - Risk Manager' > Delete API Keys from within the Sheet.


# CHANGE LOG

## v6.2 

### Spreadsheet Changes
- Added custom sorting to the DCA Calculator. Credit: @dyrty
- Added Impact Factor to the DCA Calculator - Credit: @DrGuns4Hands / @dyrty / @Fusion
- Modified ranges to use named ranges throughout the formulas - Credit: @dyrty
- Implemented current risk and future risk to account for changes in bots but not active deals
- Fixed bug in DCA max risk not taking into account currency differences
- Updated risk planner to take into account # of deals, added enabled option for existing bots.
- Modified the charts for more accurate data reporting.

### Code Changes
- Added Impact Factor to active deals to calculate where your added funds make the most impact - Credit: @DrGuns4Hands / @dyrty / @Fusion
- Improved the API Handler and migrated the code base to a Library for easier future support.
- Implemented global variables and script properties for currency / account name / account number
- BUG: loadRisk causing it to only pull enabled bots.
- BUG: Bots were limited to 50 only.
- Implemeted a new Max Deal Funds that takes into accounts manual safety orders - Credit: @dyrty
- Reordered response to pull latest 5000 deals by close date desc
- Implemented additional currency support.


# v5.6
- Modified the account and sync API calls to use the new 3c api handler
- Added bot statistics to 'Raw - Bot Data'
- Updating name to '3C Portfolio Manager'
- Added utc_today function to calculates today's date in UTC for formulas
- Added on onEdit to link dropdowns from risk monitor to risk planner. 

# v5.5

- Backend refresh to pull up to 5k deals from 3Commas.
- Side bar, menu bar, and automated adding of triggers.
- Moved API keys from being stored in the Sheet to be stored on Script properties.
- Additional read / write functions for Sheets to provide more performant pushes.
- Limited data results from 3c deals to save space in sheets.
- 3C accounts function is now a loop that provides all account details.