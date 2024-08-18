const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const lrnuclei = async (req, res, next) => {
    try {
        const url = req.body.url;
        const tag = req.body.tag;
        const severity = req.body.severity;
        const wslDistribution = 'Ubuntu-22.04';
        const venvPath = '/mnt/c/Users/prati/infosec/venv/bin/activate';
        const nucleiCommand = `nuclei -u ${url} -tags ${tag} -severity ${severity} `;
        console.log(nucleiCommand);
        const ansiRegex = (await import('ansi-regex')).default;

        // Function to extract issues and return as an array
        function extractIssues(data) {
            const patterns = [
                /missing-sri/g,
                /xss-deprecated-header/g,
                /http-missing-security-headers:cross-origin-opener-policy/g,
                /http-missing-security-headers:cross-origin-resource-policy/g,
                /http-missing-security-headers:permissions-policy/g,
                /http-missing-security-headers:x-permitted-cross-domain-policies/g,
                /http-missing-security-headers:referrer-policy/g,
                /http-missing-security-headers:clear-site-data/g,
                /http-missing-security-headers:cross-origin-embedder-policy/g,
            ];
            let results = [];
            patterns.forEach(pattern => {
                const match = data.match(pattern);
                if (match) {
                    results.push(match[0]); // Add found issue
                } else {
                    results.push(""); // Push empty string if no match found
                }
            });
            return results; // Return array of results
        }

        // Start WSL session using spawn
        console.log(`Starting WSL session with distribution: ${wslDistribution}`);
        const wslProcess = spawn('wsl', ['-d', wslDistribution], { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];

        wslProcess.stdout.on('data', (data) => {
            const cleanedData = data.toString('utf8')
                .replace(ansiRegex(), '')
                .replace(/[\\"]/g, '\\$&')
                .replace(/\u0000/g, '\\u0000');
            stdoutBuffer.push(cleanedData);
            console.log(`WSL stdout (chunk received): ${cleanedData}`);
        });

        wslProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`WSL stderr (possible warning/advice): ${data}`);
        });

        wslProcess.on('spawn', () => {
            console.log('WSL session started. Activating virtual environment and running vulnapi scan...');
            wslProcess.stdin.write(`source ${venvPath} && ${nucleiCommand}\n`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }

            // Combine stdout, extract issues, and format for output
            const stdout = stdoutBuffer.join('');
            const extractedIssues = extractIssues(stdout);
            const stderr = stderrBuffer.join('');
            req.stdout = stdout;
            req.extractedIssues = extractedIssues; // Store array in request
            req.stderr = stderr;

            next(); // Proceed to the next middleware or route handler
        });
    } catch (error) {
        res.status(403).send(error);
    }
}
module.exports = lrnuclei;
