const { spawn } = require('child_process');

const webCrawling = async (req, res, next) => {
    try {
        const url = req.user.liveurl;
        const wslDistribution = 'Ubuntu-22.04';
        const venvPath = '/mnt/c/Users/prati/infosec/venv/bin/activate';
        const hawkCommand = `404crawler crawl -u ${url}/sitemap.xml`;
        console.log(`Starting WSL session with distribution: ${wslDistribution}`);
        const wslProcess = spawn('wsl', ['-d', wslDistribution], { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];

        // Function to extract URLs using regex
        const extractUrls = (crawlOutput) => {
            const urlPattern = /https:\/\/[^\s]+/g;
            return crawlOutput.match(urlPattern) || [];
        };

        wslProcess.stdout.on('data', (data) => {
            stdoutBuffer.push(data);
            console.log(`WSL stdout (chunk received): ${data}`);
        });

        wslProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`WSL stderr (possible warning/advice): ${data}`);
        });

        wslProcess.on('spawn', () => {
            console.log('WSL session started. Activating virtual environment and running hakrawler...');
            wslProcess.stdin.write(`${hawkCommand}\n`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }

            const stdout = Buffer.concat(stdoutBuffer).toString('utf8');
            const stderr = stderrBuffer.join('');
            console.log('Hakrawler execution completed successfully. Processing output...');

            // Extract URLs from stdout
            const extractedUrls = extractUrls(stdout);
            req.apis = extractedUrls; // Load the extracted URLs into req.apis

            console.log('Extracted URLs:', req.apis);
            req.stdout = stdout;
            req.stderr = stderr;
            next();
        });

    } catch (error) {
        console.error('Error in webCrawling middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = webCrawling;
