/**

CHANGE LOG

## v6.3
- Added a realized profit field to filter out active deals showing negative.
- Fixed the calculation from `onEdit` to `onEdit / 1 minute`
- Fixed total profit by pair to include active deals.

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


 */