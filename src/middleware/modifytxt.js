const modifyTxt = async (req, res, next) => {
    try {
        const data = req.headers['stdout'];
        
        if (!data) {
            console.error('No data found in headers');
            return res.status(404).send('No data to process');
        }
        const startIndex = data.indexOf('| WELL-KNOWN PATHS |');
        if (startIndex === -1) {
            console.error('Relevant marker not found in data');
            return res.status(404).send('Relevant content marker not found');
        }
        const relevantData = data.substring(startIndex);
        const modifiedData = relevantData.replace(/sensitiveInfo/g, '******');
        req.headers['modifiedStdout'] = modifiedData;
        console.log('Data has been processed and modified.');
        next(); 
    } catch (e) {
        console.error('Caught error in modifyTxt middleware:', e);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = modifyTxt;
