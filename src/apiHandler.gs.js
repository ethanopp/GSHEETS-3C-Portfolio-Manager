/**************************************************************************
*************************************************************************

                         API Handler Notes

This API Handler is a copy of the 3Commas Google App Script API Handler.
For more information or guides on usage visit the GitHub link below.

GitHub - https://github.com/coltoneshaw/3-Commas-Google-API-Handler      
      
************************************************************************
*************************************************************************/


/**************************************************************************
 * 
 *                          Utility Functions
 * 
 *************************************************************************/
 function tryParseJSON_(jsonString) {
    try {
      var o = JSON.parse(jsonString);
      if (o && typeof o === "object") {
        return o;
      }
    }
    catch (e) { }
    return false;
  };
  
  function get3cSignature_(queryString, apisecret) {
    return Utilities.computeHmacSha256Signature(queryString, apisecret)
      .map(e => { return ("0" + (e < 0 ? e + 256 : e).toString(16)).slice(-2) })
      .join("");
  }


/**************************************************************************
 * 
 *                          Fetch Call
 * 
 *************************************************************************/

/**
 * @param {string} url This is the full URL we want to request from the API.
 * @param {string} method GET/POST/PATCH
 * @description The base fetch call that returns the parsed information.
 */
 async function fetchCall_(url, method, apikey, signature, payload) {

    //enable this console log if you're troubleshooting.
    //console.log(apikey, signature, url)
  
    let options = {
      method,
      muteHttpExceptions: true,
      'headers': {
        'APIKEY': apikey,
        'Signature': signature
      },
    }
  
    if (payload != null) {
      if (method === "POST" || method === "PATCH") {
  
        Object.assign(options, {
          'payload': payload,
          'contentType': 'application/x-www-form-urlencoded',
        })
        console.log(options)
      }
    }
    let res = UrlFetchApp.fetch(url, options)
  
    // 3 Commas can return a 200 error for invalid api endpoints.
    let successCodes = [200, 201, 204]
  
    let responseObject = {
      'data': res.getContentText(),
      'status': res.getResponseCode(),
      'headers': res.getAllHeaders()
    }
  
    console.info('Response Code - ' + responseObject.status)
  
    if (successCodes.includes(responseObject.status)) {
  
      if (method === "DELETE") {
        return responseObject
      } else {
        // inspecting if the error object is valid JSON.
        let data = tryParseJSON_(responseObject.data)
  
        if (!data) {
          // if the response is an invalid JSON object it will return false 
          let error = 'Invalid JSON object was returned. Check to make sure your endpoint is correct.'
          console.error(error)
          responseObject['error'] = error
          console.log(responseObject.error)
          return responseObject
        }
        responseObject['data'] = data
        return responseObject
      }
  
      
    } else if (responseObject.status === 429) {
      console.error('429 error - You are rate limited.')
      Object.assign(responseObject, { 'data': [] })
      return responseObject
  
    } else if (responseObject.status === 401 || responseObject.status === 404) {
      // identifying if the data can be parsed for an error code, and adding that if it exists.
      let data = tryParseJSON_(responseObject.data)
      if (data) {
        responseObject['error'] = (data.error) ? data.error + " -- " + data.error_description : "Error fetching from the API."
      } else {
        responseObject['error'] = "Error fetching from the API."
      }
  
      return responseObject
    } else {
      console.error(`Unknown error. Status Code: ${responseObject.status}`)
      return responseObject
    }
  
  
}

/**************************************************************************
 * 
 *                          GET Looped Calls
 * 
 *************************************************************************/

 async function query3cRateLimiter_(url, method, apikey, signature, timeout = 0, retryCount = 0) {

    Utilities.sleep(timeout)
    return promise = new Promise(async (resolve, reject) => {
      let apiCall = await fetchCall_(url, method, apikey, signature)
  
      if (apiCall.status === 429) {
        console.log('rate limited!!! ')
        return resolve(query3cRateLimiter_(url, method, apikey, signature, 3500, retryCount++))
      } else if (apiCall.status === 200) {
        console.log('successful call')
        resolve(apiCall)
      } else {
        resolve({ 'data': [] })
      }
    })
  
  
  
}
  

/**
   * @param {string} method - Only GET is supported right now
   * @param {string} endpoint - The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
   * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit.
   */
 async function query3cLoop_(method, endpoint, params = '', apiKeys, limit) {

    let { apikey, apisecret } = apiKeys
  
    const baseUrl = `https://api.3commas.io`
  
    let responseArray = [];
    let response;
    let offsetMax = (!limit) ? 5000 : limit;
  
    for (offset = 0; offset < offsetMax; offset += 1000) {
      let queryString = `/public/api${endpoint}?api_key=${apikey}&secret=${apisecret}&limit=1000&offset=${offset}${params}`;
      let signature = get3cSignature_(queryString, apisecret)
      response = await query3cRateLimiter_(baseUrl + queryString, method, apikey, signature)
  
      // limiting the offset to just 5000 here. This can be adjusted but made for some issues with writing to Sheets.
      if (response.data.length > 0) {
        responseArray.push(...response.data)
      }
  
      console.info({
        'responseArrayLength': responseArray.length,
        'currentResponse': response.data.length,
        offset,
        'responseCode': response.status
      })
  
      if (response.data.length != 1000) {
        break;
      }
    }
    console.log('Response data Length: ' + responseArray.length)
    return responseArray
  
  }


/**************************************************************************
 * 
 *                          Base API Call
 * 
 *************************************************************************/


/**
 * @description Querying the 3Comma's API based on the passed parameters
 * 
 * @param {string} method - REQUIRED - 'GET' / 'POST' / 'PATCH' / 'DELETE'. If using POST/PATCH a payload is required.
 * @param {string} endpoint - REQUIRED -  The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
 * @param {object} apiData - REQUIRED - This is an object structured like "{api_key: 'yourKey', 'api_secret': 'yourSecret'}""
 * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit. These are structured like "&param=value"
 * @param {boolean} loop - ( Only for GET ) - this controls if you want more than 25 results returned. It'll loop through and provide all the data at that endpoint.
 * @param {object} payload - ( Only for POST / PATCH )
 * @param {object} limit - (Only for GET) - If you want to limit the results to a specific number instead of the entire data set.
 * 
 * @return {object} - If calling with loop = true it returns your array of data, nothing else. If loop = false it returns "{ data, status, headers }" 
 */
 async function API_(apiKeys, method, endpoint, params = '', loop, payload, limit = '') {
    let { apikey, apisecret } = apiKeys
    if (!method || !endpoint) {
      throw new Error("Missing the method or endpoint.")
    }
    if (!apikey || !apisecret) {
      throw new Error("Missing API keys. Make sure to pass an object into the API function structred like this --- '{apikey, apisecret}' ")
    }
  
    if (method === "GET" && loop === true) {
      // returns just the data array, no need for a .data or .status
      let data = await query3cLoop_(method, endpoint, params, apiKeys, limit)
  
      return { 'data': data }
    }
  
    const baseUrl = `https://api.3commas.io`
    let queryString = `/public/api${endpoint}?api_key=${apikey}&secret=${apisecret}${params}`;
    let signature;
    let url = baseUrl + queryString
    let apiCall;
  
    if (method === "GET") {
      try {
        signature = get3cSignature_(queryString, apisecret)
        apiCall = await fetchCall_(url, method, apikey, signature);
        console.log('GET Call to single URL - ' + url)
      } catch (error) {
        console.log(error)
      }
    } else if (method === "POST") {
      try {

        let body = (payload) ? queryString + payload : queryString
        signature = get3cSignature_(body, apisecret)
        apiCall = await fetchCall_(url, method, apikey, signature, payload);
        console.log('POSTED to single URL- ' + url)
      } catch (error) {
        console.log(error)
      }
    } else if (method === "PATCH") {
      try {
        let body = (payload) ? queryString + payload : queryString
        signature = get3cSignature_(body, apisecret)
        apiCall = await fetchCall_(url, method, apikey, signature, payload);
        console.log('PATCHED to single URL- ' + url)
      } catch (error) {
        console.log(error)
      }
    } else if (method === "DELETE") {
      try {
        signature = get3cSignature_(queryString, apisecret)
        apiCall = await fetchCall_(url, method, apikey, signature, payload);
        console.log('DELETED from a single URL- ' + url)
      } catch (error) {
        console.log(error)
      }
    }
  
    return apiCall
  }
  
  /**************************************************************************
   * 
   *                     API Endpoint Calls.
   * 
   **************************************************************************/
  
  
  /**
   * @description GET call to the 3Commas' API.
   * 
   * @param {object} apiKeys - REQUIRED - This is an object structured like "{api_key: 'yourKey', 'api_secret': 'yourSecret'}""
   * @param {string} endpoint - REQUIRED -  The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
   * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit. These are structured like "&param=value"
   * @param {boolean} loop - This controls if you want more than 25 results returned. It'll loop through and provide all the data at that endpoint.
   * @param {object} limit - If you want to limit the results to a specific number instead of the entire data set.
   * 
   * @return {object} - If calling with loop = true it returns '{data: [] }'. If loop = false it returns "{ data , status, headers, error }" 
   */
  async function GET(apiKeys, endpoint, params = '', loop = false, limit = '') {
    payload = null
    method = "GET"
    return await API_(apiKeys, method, endpoint, params, loop, payload, limit)
  }
  
  /**
   * @description POST call to the 3Commas' API.
   * 
   * @param {object} apiKeys - REQUIRED - This is an object structured like "{api_key: 'yourKey', 'api_secret': 'yourSecret'}""
   * @param {string} endpoint - REQUIRED -  The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
   * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit. These are structured like "&param=value"
   * @param {string} payload - This is an extention of the params. Pass data as a string following the syntax of params.
   * 
   * @return {object} - "{ data , status, headers, error }" For more details see the GitHub documentation.
   */
  
  async function POST(apiKeys, endpoint, params = '', payload) {
    let loop, limit = null;
    method = "POST"
    return await API_(apiKeys, method, endpoint, params, loop, payload, limit)
  }
  
  /**
   * @description PATCH call to the 3Commas' API.
   * 
   * @param {object} apiKeys - REQUIRED - This is an object structured like "{api_key: 'yourKey', 'api_secret': 'yourSecret'}""
   * @param {string} endpoint - REQUIRED -  The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
   * @param {string} params - If additional params are needed to be passed in, do not include the offset or limit. These are structured like "&param=value"
   * @param {string} payload - This is an extention of the params. Pass data as a string following the syntax of params.
   * 
   * @return {object} - "{ data , status, headers, error }" For more details see the GitHub documentation.
   */
  async function PATCH(apiKeys, endpoint, params = '', payload) {
    let loop, limit = null;
    method = "PATCH"
    return await API_(apiKeys, method, endpoint, params, loop, payload, limit)
  }
  
  
  /**
   * @description DELETE call to the 3Commas' API.
   * 
   * @param {object} apiKeys - REQUIRED - This is an object structured like "{api_key: 'yourKey', 'api_secret': 'yourSecret'}""
   * @param {string} endpoint - REQUIRED -  The url endpoint from 3C. Do NOT include the '/public/api/' into this. It should be '/ver1/bots' for example.
   * 
   * @return {object} - "{ data , status, headers, error }" For more details see the GitHub documentation.
   */
  async function DELETE(apiKeys, endpoint) {
    let loop, limit, params, payload = null;
    method = "DELETE"
    return await API_(apiKeys, method, endpoint, params, loop, payload, limit)
}

function returnApiKeys(){
    return {
        'apikey' : getScriptProperty('api_id'),
        'apisecret': getScriptProperty('api_secret')
    }
}