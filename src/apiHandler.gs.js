/************************************************
*
*           API Fetch Call
*
 ************************************************/

/**
 * @param {string} url This is the full URL we want to request from the API.
 * @param {string} method GET/POST/PATCH
 * @description The base fetch call that returns the parsed information.
 */
async function fetchCall(url, method, apikey, signature) {

    // enable this console log if you're troubleshooting.
    //console.log(apikey, signature, url)
    
    let options = {
        method,
        muteHttpExceptions: true,
        'headers': {
            'APIKEY': apikey,
            'Signature': signature
        },
    }


    let res = UrlFetchApp.fetch(url, options)
    console.info('Response Code - ' + res.getResponseCode())

    let successCodes = [200, 201, 204]
    let responseCode = res.getResponseCode()

    if (successCodes.includes(responseCode)) {
        return {
            'data': JSON.parse(res.getContentText()),
            'status': res.getResponseCode(),
            'headers': res.getAllHeaders()
        }
    } else if (responseCode === 429) {
        return {
            'data': [],
            'status': res.getResponseCode(),
            'headers': res.getAllHeaders()
        }
    } else {
        console.log(res.getResponseCode())
        console.log(res.getAllHeaders())
        console.log(res.getContentText())
    }


}

async function query3cRateLimiter(url, method, apikey, signature, timeout = 0, retryCount = 0) {

    Utilities.sleep(timeout)
    return promise = new Promise(async (resolve, reject) => {
        let apiCall = await fetchCall(url, method, apikey, signature)

        if (apiCall.status === 429) {
            // setting the timeout for 3500... because why not?
            console.log('rate limited!!! ')
            return resolve(query3cRateLimiter(url, method, apikey, signature, 3500, retryCount++))
        } else if (apiCall.status === 200) {
            console.log('successful call')
            resolve(apiCall)
        } else {
            resolve({ 'data': [] })
        }
    })



}


async function query3cLoop(method, endpoint, params = '') {
    /**
     * @param {string} method - Only GET is supported right now
     * @param {string} endpoint - The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
     * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit.
     */

    const apikey = getScriptProperty('api_id')
    const apisecret = getScriptProperty('api_secret');

    const baseUrl = `https://api.3commas.io`

    let responseArray = [];
    let response;
    //let offset = 0;
    let offsetMax = 5000

    for(offset = 0; offset < offsetMax; offset += 1000){
        let queryString = `/public/api${endpoint}?api_key=${apikey}&secret=${apisecret}&limit=1000&offset=${offset}${params}`;
        let signature = get3cSignature(queryString, apisecret)
        response = await query3cRateLimiter(baseUrl + queryString, method, apikey, signature)

        // limiting the offset to just 5000 here. This can be adjusted but made for some issues with writing to Sheets.
        if (response.data.length > 0) {
            responseArray.push(...response.data)
        }

        console.info({
            'responseArrayLength': responseArray.length,
            'currentResponse': response.data.length,
            offset,
            'responseCode':response.status
            })

        if(response.data.length != 1000){
            break;
        }
        

    }

    console.log(responseArray.length)


    return responseArray

}

async function query3commasAPI(method, endpoint, params = '', loop) {

    // fetching API information from the script properties.
    if (method === "GET" && loop === true) {
        // returns just the data array, no need for a .data or .status
        return await query3cLoop(method, endpoint, params)
    }

    const apikey = getScriptProperty('api_id')
    const apisecret = getScriptProperty('api_secret');
    const baseUrl = `https://api.3commas.io`
    let queryString = `/public/api${endpoint}?api_key=${apikey}&secret=${apisecret}${params}`;
    const signature = get3cSignature(queryString, apisecret)
    let url = baseUrl + queryString
    let apiCall;

    if (method === "GET") {
        try {
            apiCall = await fetchCall(url, method, apikey, signature);
            console.log('Got a single something - ' + url)
        } catch (error) {
            console.error({
                'message': 'error getting from the API',
                'error': error,
                'url': url,
                'headers' : apiCall.headers,
                'status': apiCall.status
            })
        }


    } else if (method === "POST") {
        try {
            apiCall = await fetchCall(url, method, apikey, signature);
            console.log('posted something - ' + url)
        } catch (error) {
            console.error({
                'message': 'error posting to the API',
                'error': error,
                'url': url,
                'headers' : apiCall.headers,
                'status': apiCall.status
            })
        }

    }

    let { data, status, headers } = apiCall
    return { data, status, headers }

}




function get3cSignature(queryString, apisecret) {
    return Utilities.computeHmacSha256Signature(queryString, apisecret)
        .map(e => { return ("0" + (e < 0 ? e + 256 : e).toString(16)).slice(-2) })
        .join("");
}

