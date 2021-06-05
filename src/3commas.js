/************************************************
*
*           3Commas Deals
*
 ************************************************/


async function getActiveDeals() {
    /**
     * @description Fetching only the active deals within 3c.
     */

    let endpoint = "/public/api/ver1/deals"
    let params = `&scope=active`

    return await query3cNEW('GET', endpoint, params)
}

async function getCompletedDeals() {
    /**
     * @description Fetching only the completed deals within 3c.
     */
    let endpoint = "/public/api/ver1/deals"
    let params = `&scope=completed`

    return await query3cNEW('GET', endpoint, params)
}

async function get3cdeals() {
    /**
     * @description - The primary deal fetch function. This pulls both Active and Completed deals.
     */

    // TODO - this needs to be a dynamic variable within the sync function, or stored in document properties.
    let dealRawTab = 'deals (raw)'

    let activeDeals = await getActiveDeals();
    let completedDeals = await getCompletedDeals();
    console.log(completedDeals[0])
    let accountData = await get3caccounts();


    activeDeals.map(deal => deal['status'] = "active")
    completedDeals.map(deal => deal['status'] = "completed")

    let apiCall = [...activeDeals, ...completedDeals]

    let dataArray = []

    // Load data into new array with only the columns we want and format them
    apiCall.forEach(row => {

        let { account_id, id, max_safety_orders, status, active_safety_orders_count, created_at, updated_at, closed_at, completed_safety_orders_count, pair, take_profit, base_order_volume, safety_order_volume, safety_order_step_percentage, bought_volume, bought_amount, bought_average_price, base_order_average_price, sold_amount, sold_volume, sold_average_price, final_profit, profit_currency, martingale_coefficient, martingale_volume_coefficient, martingale_step_coefficient, stop_loss_percentage, from_currency, to_currency, current_price, take_profit_price, stop_loss_price, final_profit_percentage, actual_profit_percentage, bot_name, account_name, usd_final_profit, actual_profit, actual_profit_usd } = row

        // commented out the excess columns to save space / speed.

        function deal_hours(created_at, closed_at) {

            created_at = Date.parse(created_at)
            let endDate;

            if (closed_at === null) {
                endDate = Date.now()
            } else {
                endDate = Date.parse(closed_at)
            }
            let milliseconds = Math.abs(created_at - endDate);
            const hours = milliseconds / 36e5;
            return hours.toFixed(2)
        }

        function deal_days(closed_at) {

            let endDate;

            if (closed_at !== null) {
                closed_at = Date.parse(new Date(closed_at))
                endDate = Date.parse(new Date())
            } else {
                return null
            }

            let milliseconds = Math.abs(closed_at - endDate);
            const days = milliseconds / (1000 * 3600 * 24);
            return Math.ceil(days)
        }

        let dealHours = deal_hours(created_at, closed_at)

        let profitPercent = (( ( +actual_profit + +bought_volume ) - +bought_volume)  /  +bought_volume) / +bought_volume / +dealHours

        let tempObject = {
            id,
            // bot_id,
            status,
            'max_safety_orders': +max_safety_orders,
            account_id,
            'account_name': accountData.find(account => account.id === account_id).name,
            // active_safety_orders_count,
            'created_at (UTC)': Utilities.formatDate(new Date(created_at), "UTC", "MM-dd-yyyy"),
            'updated_at (UTC)': Utilities.formatDate(new Date(updated_at), "UTC", "MM-dd-yyyy"),
            'closed_at (UTC)': (closed_at != null) ? Utilities.formatDate(new Date(closed_at), "UTC", "MM-dd-yyyy") : null,
            'deal_hours': dealHours,
            completed_safety_orders_count,
            'pair' : pair.split("_")[1],
            from_currency,
            take_profit,
            'base_order_volume': +base_order_volume,
            'safety_order_volume': +safety_order_volume,
            'safety_order_step_percentage': +safety_order_step_percentage,
            'bought_amount': +bought_amount,
            'bought_volume': +bought_volume,
            // 'bought_average': +bought_average,
            'bought_average_price': +bought_average_price,
            'sold_amount': +sold_amount,
            'sold_volume': +sold_volume,
            // 'sold_average_price': +sold_average_price,
            // 'final_profit' : +final_profit,
            'martingale_coefficient': +martingale_coefficient,
            'martingale_volume_coefficient': +martingale_volume_coefficient,
            'martingale_step_coefficient': +martingale_step_coefficient,
            // 'stop_loss_percentage': +stop_loss_percentage,
            // profit_currency,
            // from_currency,
            // to_currency,
            'current_price': +current_price,
            'take_profit_price': +take_profit_price,
            // 'stop_loss_price' : +stop_loss_price,
            // 'final_profit_percentage': +final_profit_percentage,
            bot_name,
            // account_name,
            // usd_final_profit,
            actual_profit,
            actual_profit_usd,
            'days_old': deal_days(closed_at),
            'hourly_per_unit_profit_percent' :  profitPercent,
            closed_at
        }

        dataArray.push(tempObject);
    })

    // Insert new array into spreadsheet
    await pushToSheet(dealRawTab, dataArray);

}



/************************************************
*
*           3Commas Accounts
*
 ************************************************/

async function get3caccounts() {
    /**
     * @description - Pulling only acccounts to be used in other functions. Currently this does not push to a sheet.
     */

    var apiCall = await query3c("get", "/public/api/ver1/accounts", "");
    let dataArray = []

    // Load data into new array with only the columns we want and format them
    apiCall.forEach(row => {
        let { id, name, market_code } = row
        let tempObject = {
            id,
            name,
            market_code
        }
        dataArray.push(tempObject);
    })

    // Not currently inserting into the sheet.
    //pushToSheet('Account (raw)', dataArray);
    return dataArray

}

async function get3cpie() {
    /**
     * @description Pulling the account balances by account. This is in a loop because the endpoint only allows a single account ID at a time.
     */

    let accountData = await get3caccounts()
    let dataArray = []

    for (account of accountData) {
        let { id, name, market_code } = account
        var apiCall = await query3c("post", "/public/api/ver1/accounts/" + id + "/account_table_data", "");

        // Load data into new array with only the columns we want and format them
        for (row of apiCall) {

            let { currency_code, percentage, position, btc_value, usd_value, on_orders } = row
            let tempObject = {
                'account_id': id,
                'account_name': name,
                currency_code,
                'percentage': percentage.toFixed(2),
                position,
                on_orders,
                btc_value,
                'usd_value': usd_value.toFixed(2),
                market_code
            }

            dataArray.push(tempObject);
        }

    }

    // Insert new array into spreadsheet
    pushToSheet('Account Balances (raw)', dataArray);

}


/************************************************
*
*           3Commas Sync Exchange
*
 ************************************************/

// TODO - Migrate this to the new query function.

async function syncExchangeBalanceTo3c() {
    // Grab all Account IDs
    let accountData = await get3caccounts()

    for(account in accountData){
        query3c("post", `/public/api/ver1/accounts/${account.id}/load_balances`, "")
    }

}



function query3c(requesttype, endPoint, params, query, options) {
    //var config = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Instructions");
    const apikey = getScriptProperty('api_id')
    const apisecret = getScriptProperty('api_secret');

    var baseUrl = "https://api.3commas.io";

    // var pointParams = "?" + params;

    if (params.length > 0) {
        var pointParams = "?" + params + "&";
    } else {
        var pointParams = "?";
    }


    var queryString = endPoint + pointParams + 'api_key=' + apikey + '&secret=' + apisecret; // Modified
    var signature = Utilities.computeHmacSha256Signature(queryString, apisecret); // Added
    signature = signature.map(function (e) {
        return ("0" + (e < 0 ? e + 256 : e).toString(16)).slice(-2)
    }).join(""); // Added

    //headers
    var hparams = {
        'method': requesttype,
        'headers': {
            'APIKEY': apikey,
            'Signature': signature
        },
        'muteHttpExceptions': true
    };

    return JSON.parse(UrlFetchApp.fetch(baseUrl + queryString, hparams).getContentText());
}
