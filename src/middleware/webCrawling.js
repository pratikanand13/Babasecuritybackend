const { spawn } = require('child_process');

const webCrawling = async (req, res, next) => {
    try {
        const url = req.user.liveurl;
        const hawkCommand = `404crawler crawl -u https://${url}/sitemap.xml`;

        console.log(`Running command: ${hawkCommand}`);
        
        const process = spawn(hawkCommand, { shell: true });

        let stdoutBuffer = [];

        process.stdout.on('data', (data) => {
            stdoutBuffer.push(data.toString());
            console.log(`stdout (chunk received): ${data}`);
        });

        // Ignore stderr output by not processing it
        process.stderr.on('data', (data) => {
            // You can choose to log it if needed, but it will be ignored here
        });

        process.on('close', (code) => {
            if (code !== 0) {
                console.error(`Process exited with code ${code}, but continuing to process stdout.`);
            }

            // Function to extract URLs using regex
            const extractUrls = (crawlOutput) => {
                const urlPattern = /https:\/\/[^\s]+/g;
                return crawlOutput.match(urlPattern) || [];
            };

            // Process the collected stdout data
            const stdout = stdoutBuffer.join('');
            const extractedUrls = extractUrls(stdout);
            req.apis = extractedUrls; // Load the extracted URLs into req.apis

            console.log('Extracted URLs:', req.apis);
            next(); // Proceed to the next middleware
        });

    } catch (error) {
        console.error('Error in webCrawling middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = webCrawling;
