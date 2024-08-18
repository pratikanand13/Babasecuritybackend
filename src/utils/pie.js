function processApiData(apiData) {
    const accessCountsPerEndpoint = {};
    const responseCodesPerEndpoint = {};

    for (const [endpoint, methods] of Object.entries(apiData)) {
        let totalAccessCount = 0;

        // Combine access counts from all methods (GET, POST, etc.)
        for (const [method, data] of Object.entries(methods)) {
            totalAccessCount += data.access_count;

            // Combine response codes from all methods (GET, POST, etc.)
            for (const [code, count] of Object.entries(data.response_codes)) {
                if (!responseCodesPerEndpoint[endpoint]) {
                    responseCodesPerEndpoint[endpoint] = {};
                }
                responseCodesPerEndpoint[endpoint][code] = 
                    (responseCodesPerEndpoint[endpoint][code] || 0) + count;
            }
        }

        // Store the total access count for the endpoint
        accessCountsPerEndpoint[endpoint] = totalAccessCount;
    }

    return { accessCountsPerEndpoint, responseCodesPerEndpoint };
}

module.exports = processApiData