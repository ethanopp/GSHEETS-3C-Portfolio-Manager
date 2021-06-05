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

    console.log(apikey, signature, url)


    let options = {
        method,
        muteHttpExceptions: true,
        'headers': {
            'APIKEY': apikey,
            'Signature': signature
        },

    }

    let res = UrlFetchApp.fetch(url, options)
    console.log(res.getResponseCode())

    let successCodes = [200, 201, 204]
    let responseCode = res.getResponseCode()

    if (successCodes.includes(responseCode)) {
        return {
            'data': JSON.parse(res.getContentText()),
            'status': res.getResponseCode(),
            'headers': res.getAllHeaders()
        }
    } else if(responseCode === 429) {
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

async function query3cRateLimiter(url, method, apikey, signature, timeout = 0, retryCount = 0){

    Utilities.sleep(timeout)
    return promise = new Promise(async (resolve, reject) => {
        let apiCall = await fetchCall(url, method, apikey, signature)

        if(apiCall.status === 429){
            // setting the timeout for 3500... because why not?
            console.log('rate limited!!! ')
            return resolve( query3cRateLimiter(url, method, apikey, signature, 3500, retryCount++) )
        } else if(apiCall.status === 200) {
            console.log('successful call')
            resolve(apiCall)
        } else {
            resolve({'data' : []})
        }
    })
        


}


async function query3cNEW(method, endpoint, params = '') {
    /**
     * @param {string} method - Only GET is supported right now
     * @param {string} endpoint - The url endpoint from 3C.
     * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit.
     */
    
    const apikey = getScriptProperty('api_id')
    const apisecret = getScriptProperty('api_secret');

    const baseUrl = `https://api.3commas.io`

    let responseArray = [];
    let response;
    let offset = 0;

    do {
        let queryString = `${endpoint}?api_key=${apikey}&secret=${apisecret}&limit=1000&offset=${offset}${params}`; // Modified

        let signature = Utilities.computeHmacSha256Signature(queryString, apisecret)
            .map(e => {return ("0" + (e < 0 ? e + 256 : e).toString(16)).slice(-2)})
            .join("");
            
        response = await query3cRateLimiter(baseUrl + queryString, method, apikey, signature)

        // limiting the offset to just 5000 here. This can be adjusted but made for some issues with writing to Sheets.
        if(response.data.length > 0 || offset < 5000){
            responseArray.push(...response.data)
            offset = offset + 1000
        }
    } while( response.data.length > 0)

    console.log(responseArray.length)


    return responseArray

}

