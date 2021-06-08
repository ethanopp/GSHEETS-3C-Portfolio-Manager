function calculateMaxDealFunds(max_safety_orders, base_order_volume, safety_order_volume, martingale_volume_coefficient){
    let maxTotal = +safety_order_volume + +base_order_volume;
    let previousSO = +safety_order_volume

    for (i = 2; i <= max_safety_orders; i++) {
        previousSO = (previousSO * martingale_volume_coefficient)
        maxTotal += previousSO
    }
    
    return maxTotal.toFixed(2)
}



/************************************************
*
*           3Commas Deals
*
 ************************************************/


async function getActiveDeals() {
    /**
     * @description Fetching only the active deals within 3c.
     * 
     * @api_docs - https://github.com/3commas-io/3commas-official-api-docs/blob/master/deals_api.md#user-deals-permission-bots_read-security-signed
     */

    let endpoint = "/ver1/deals"
    let params = `&scope=active`

    let apiCall = await query3commasAPI('GET', endpoint, params, true)  
    apiCall.map(deal => deal['status'] = "active")

    return apiCall
}

async function getCompletedDeals() {
    /**
     * @description Fetching only the completed deals within 3c.
     * 
     * @api_docs - https://github.com/3commas-io/3commas-official-api-docs/blob/master/deals_api.md#user-deals-permission-bots_read-security-signed
     */
    let endpoint = "/ver1/deals"
    let params = `&scope=completed`

    let apiCall = await query3commasAPI('GET', endpoint, params, true)
    apiCall.map(deal => deal['status'] = "completed")

    return apiCall
        
}

async function get3cdeals() {
    /**
     * @description - The primary deal fetch function. This pulls both Active and Completed deals.
     * 
     */

    let activeDeals = await getActiveDeals();
    let completedDeals = await getCompletedDeals();
    //let accountData = await get3caccounts();
    let botData = await get3cBots();
    //console.log(botData)

    let apiCall = [...activeDeals, ...completedDeals]

    let dataArray = []

    // Load data into new array with only the columns we want and format them
    apiCall.forEach(row => {

        let { 
            account_id, bot_id, id, max_safety_orders, 
            status, active_safety_orders_count, created_at, 
            updated_at, closed_at, completed_safety_orders_count, 
            pair, take_profit, base_order_volume, 
            safety_order_volume, safety_order_step_percentage, bought_volume, 
            bought_amount, bought_average_price, base_order_average_price, 
            sold_amount, sold_volume, sold_average_price, final_profit, 
            profit_currency, martingale_coefficient, martingale_volume_coefficient, 
            martingale_step_coefficient, stop_loss_percentage, from_currency, 
            to_currency, current_price, take_profit_price, stop_loss_price, 
            final_profit_percentage, actual_profit_percentage, bot_name, 
            account_name, usd_final_profit, actual_profit, actual_usd_profit
        } = row

        // bot API to define if this is a single / composite bot.
        let bot_type = botData.find(bot => bot.id === bot_id)        
        if(bot_type != undefined){
            bot_type = bot_type.type.split('::')[1]
        } else {
            bot_type = "deleted"
        }

        

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

        // function deal_days(closed_at) {

        //     let endDate;

        //     if (closed_at !== null) {
        //         closed_at = Date.parse(new Date(closed_at))
        //         endDate = Date.parse(new Date())
        //     } else {
        //         return null
        //     }

        //     let milliseconds = Math.abs(closed_at - endDate);
        //     const days = milliseconds / (1000 * 3600 * 24);
        //     return Math.ceil(days)
        // }
        
        let dealHours = deal_hours(created_at, closed_at)
        let max_deal_funds = calculateMaxDealFunds(max_safety_orders, base_order_volume, safety_order_volume, martingale_volume_coefficient)

        let profitPercent = (((+actual_profit + +bought_volume) - +bought_volume) / +bought_volume) / +bought_volume / +dealHours

        let tempObject = {
            id,
            status,
            'max_safety_orders': +max_safety_orders,
            account_id,
            bot_id,
            'created_at (UTC)': Utilities.formatDate(new Date(created_at), "UTC", "MM-dd-yyyy"),
            'open_1': null,
            'closed_at (UTC)': (closed_at != null) ? Utilities.formatDate(new Date(closed_at), "UTC", "MM-dd-yyyy") : null,
            'deal_hours': dealHours,
            completed_safety_orders_count,
            'pair': pair.split("_")[1],
            from_currency,
            take_profit,
            'base_order_volume': +base_order_volume,
            'safety_order_volume': +safety_order_volume,
            'max_deal_funds': max_deal_funds,
            'bought_amount': +bought_amount,
            'bought_volume': +bought_volume,
            'bought_average_price': +bought_average_price,
            'sold_amount': +sold_amount,
            'sold_volume': +sold_volume,
            'martingale_coefficient': +martingale_coefficient,
            'martingale_volume_coefficient': +martingale_volume_coefficient,
            'martingale_step_coefficient': +martingale_step_coefficient,
            'current_price': +current_price,
            'take_profit_price': +take_profit_price,
            'bot_name': (bot_type === 'SingleBot') ? bot_name :`${bot_name} - ${pair}`,
            actual_profit,
            actual_usd_profit,
            'open_3': null,
            'hourly_per_unit_profit_percent': profitPercent,
        }

        dataArray.push(tempObject);
    })

    // Insert new array into spreadsheet
    let tabName = tabs().deal_tab
    await pushToSheet(tabName, dataArray);

}

/************************************************
*
*           3Commas Bots
*
 ************************************************/

async function get3cBots() {
    /**
     * @description Fetching only the bots data within 3c
     * 
     * @apiDocs - https://github.com/3commas-io/3commas-official-api-docs/blob/master/bots_api.md#user-bots-permission-bots_read-security-signed
     */

    let endpoint = "/ver1/bots"
    let params = '&bot_id=4416522'

    let response = await query3commasAPI('GET', endpoint, params, false)

    let dataArray = []

    for (bot of response.data) {
        let {
            id, account_id, account_name, is_enabled,
            max_safety_orders, active_safety_orders_count,
            max_active_deals, active_deals_count,
            name, take_profit,
            base_order_volume, safety_order_volume,
            safety_order_step_percentage, type,
            martingale_volume_coefficient, martingale_step_coefficient,
            profit_currency, finished_deals_profit_usd,
            finished_deals_count, pairs
            } = bot

        

        let maxDealFunds = calculateMaxDealFunds(max_safety_orders, base_order_volume, safety_order_volume, martingale_volume_coefficient)
        //max_active_deals = 15

        let max_inactive_funds = maxDealFunds * (max_active_deals - active_deals_count)


        // bot stats from this endpoint are not benefical as the only additional data it shows is today's profits.
        // let botStats = await query3commasAPI('GET', '/ver1/bots/stats', `&bot_id=${id}`, false)
        
        let botObject = {
            id,
            account_id,
            name,
            //account_name,
            is_enabled,
            type,
            'from_currency': pairs[0].split('_'),
            'max_funds': maxDealFunds * max_active_deals,
            'max_funds_per_deal' : maxDealFunds,
            'max_inactive_funds': max_inactive_funds,
            'enabled_inactive_funds': (is_enabled == true) ? +max_inactive_funds : 0 ,
            'enabled_active_funds': (is_enabled == true) ? +maxDealFunds * active_deals_count : 0 ,
            max_safety_orders,
            active_safety_orders_count,
            max_active_deals,
            active_deals_count,
            take_profit,
            base_order_volume,
            safety_order_volume,
            safety_order_step_percentage,
            martingale_volume_coefficient,
            martingale_step_coefficient,
            profit_currency,
            finished_deals_profit_usd,
            finished_deals_count,
            
        }

        dataArray.push(botObject)
    }

    let tab = tabs().bot_tab;
    // needs to be pushed to a sheet as well
    pushToSheet(tab, dataArray)

    return dataArray
}



/************************************************
*
*           3Commas Accounts
*
 ************************************************/

async function get3caccounts() {
    /**
     * @description - Pulling only acccounts to be used in other functions. Currently this does not push to a sheet.
     * 
     * @api_docs https://github.com/3commas-io/3commas-official-api-docs/blob/master/accounts_api.md
     */

    let endpoint = "/ver1/accounts"
    let params = ''

    var apiCall = await query3commasAPI("GET", endpoint, params, false);
    let dataArray = []

    // Load data into new array with only the columns we want and format them
    for (account of apiCall.data) {
        let { id, name, market_code } = account
        let tempObject = {
            id,
            name,
            market_code
        }
        dataArray.push(tempObject);
    }

    // Not currently inserting into the sheet.
    //pushToSheet('Account (raw)', dataArray);
    return dataArray

}

async function get3cpie() {
    /**
     * @description Pulling the account balances by account. This is in a loop because the endpoint only allows a single account ID at a time.
     * 
     * @api_docs - https://github.com/3commas-io/3commas-official-api-docs/blob/master/accounts_api.md#information-about-all-user-balances-on-specified-exchange--permission-accounts_read-security-signed
     * 
     */

    let accountData = await get3caccounts()
    let dataArray = []

    for (account of accountData) {
        let { id, name, market_code } = account

        let endpoint = `/ver1/accounts/${id}/account_table_data`
        let params = ''
        var apiCall = await query3commasAPI("POST", endpoint, params, false);

        // Load data into new array with only the columns we want and format them
        for (row of apiCall.data) {

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
    let tabName = tabs().account_balances_tab
    pushToSheet(tabName, dataArray);

}


/************************************************
*
*           3Commas Sync Exchange
*
 ************************************************/


async function syncExchangeBalanceTo3c() {
    /**
     * @description - reloading 3Commas to sync back with the balance API.
     * 
     * @api_docs - https://github.com/3commas-io/3commas-official-api-docs/blob/master/accounts_api.md#load-balances-for-specified-exchange--permission-accounts_read-security-signed
     */
    // Grab all Account IDs
    let accountData = await get3caccounts()

    for (account of accountData) {
        await query3commasAPI("POST", `/ver1/accounts/${account.id}/load_balances`, "", false)
        
    }

}


