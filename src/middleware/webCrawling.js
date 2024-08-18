const { exec } = require('child_process');

const webCrawling = async (req, res, next) => {
    try {
        const url = req.user.liveurl;
        const hawkCommand = `404crawler crawl -u ${url}/sitemap.xml`;

        console.log(`Running command: ${hawkCommand}`);
        console.log(`Environment: ${JSON.stringify(process.env)}`);

        exec(hawkCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
                return res.status(500).send('Error during process execution');
            }

            if (stderr) {
                console.warn(`stderr: ${stderr}`);
            }

            // Function to extract URLs using regex
            const extractUrls = (crawlOutput) => {
                const urlPattern = /https:\/\/[^\s]+/g;
                return crawlOutput.match(urlPattern) || [];
            };

            // Process the collected stdout data
            const extractedUrls = extractUrls(stdout);
            req.apis = extractedUrls; // Load the extracted URLs into req.apis

            console.log('Extracted URLs:', req.apis);
            console.log('Log successfully written to file.');

            next(); // Proceed to the next middleware
        });

    } catch (error) {
        console.error('Error in webCrawling middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = webCrawling;
