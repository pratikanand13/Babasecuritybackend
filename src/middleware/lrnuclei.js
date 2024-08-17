const { spawn } = require('child_process');
const path = require('path');


const lrnuclei = async (req, res, next) => {
    try {
        const url = req.body.url;
        const tag = req.body.tag;
        const severity = req.body.severity;
        const wslDistribution = 'Ubuntu-22.04';

        // Get the venv path dynamically and convert to WSL format
       

        const nucleiCommand = `nuclei -u ${url} -tags ${tag} -severity ${severity}`;
        console.log(nucleiCommand);

        const ansiRegex = (await import('ansi-regex')).default;

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
                    results.push(match[0]);
                } else {
                    results.push("");
                }
            });
            return results;
        }

        console.log(`Starting WSL session with distribution: ${wslDistribution}`);
        const wslProcess = spawn('wsl', ['-d', wslDistribution], { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];
        let datacopyBuffer = [];

        wslProcess.stdout.on('data', (data) => {
            datacopyBuffer.push(data);
            const cleanedData = data.toString('utf8')
                .replace(ansiRegex(), '')
                .replace(/[\\"]/g, '\\$&')
                .replace(/\u0000/g, '\\u0000');
            stdoutBuffer.push(cleanedData);
            console.log(`WSL stdout (chunk received): ${data}`);
        });

        wslProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`WSL stderr (possible warning/advice): ${data}`);
        });

        wslProcess.on('spawn', () => {
            console.log('WSL session started. Activating virtual environment and running vulnapi scan...');
            // Use the Linux-style path for WSL
            wslProcess.stdin.write(`${nucleiCommand}`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }

            const dataCopy = Buffer.concat(datacopyBuffer).toString('utf8');
            const stdout = stdoutBuffer.join('');
            const extractedIssues = extractIssues(stdout);
            const stderr = stderrBuffer.join('');
            const fullcmd = stderr + dataCopy;

            req.stdout = stdout;
            req.extractedIssues = extractedIssues;
            req.stderr = stderr;
            req.fullcmd = fullcmd;
            next();
        });
    } catch (error) {
        res.status(403).send(error);
    }
};

module.exports = lrnuclei;
