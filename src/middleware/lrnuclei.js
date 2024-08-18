const { spawn } = require('child_process');

const lrnuclei = async (req, res, next) => {
    try {
        const url = req.body.url;
        if (!url) {
            return res.status(403).send("This feature is available only for live hosted links");
        }
        
        const tag = req.body.tag;
        const severity = req.body.severity;

        // Constructing the nuclei command based on the request parameters
        let nucleiCommand = `nuclei -u ${url}`;
        if (tag && severity) {
            nucleiCommand += ` -tags ${tag} -severity ${severity}`;
        } else if (tag) {
            nucleiCommand += ` -tags ${tag}`;
        } else if (severity) {
            nucleiCommand += ` -severity ${severity}`;
        }

        const ansiRegex = (await import('ansi-regex')).default;

        function extractIssues(data) {
            const pattern = /\[(.*?)\]/g; 
            let results = [];
            let match;
            while ((match = pattern.exec(data)) !== null) {
                results.push(match[0]); 
            }
            return results;
        }

        let stdoutBuffer = [];
        let stderrBuffer = [];

        console.log('Running nuclei scan...');
        const nucleiProcess = spawn(nucleiCommand, { shell: true });

        nucleiProcess.stdout.on('data', (data) => {
            const cleanedData = data.toString('utf8')
                .replace(ansiRegex(), '')
                .replace(/[\\"]/g, '\\$&')
                .replace(/\u0000/g, '\\u0000');
            stdoutBuffer.push(cleanedData);
            console.log(`Nuclei stdout (chunk received): ${cleanedData}`);
        });

        nucleiProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`Nuclei stderr (possible warning/advice): ${data}`);
        });

        nucleiProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`Nuclei process exited with code ${code}`);
                return res.status(500).send('Error during nuclei process execution');
            }
            const stdout = stdoutBuffer.join('');
            const extractedIssues = extractIssues(stdout);
            const stderr = stderrBuffer.join('');
            const terminalOut = stdout + stderr;

            req.stdout = stdout;
            req.extractedIssues = extractedIssues;
            req.terminalOut = terminalOut;
            next();
        });
    } catch (error) {
        res.status(403).send(error.message);
    }
};

module.exports = lrnuclei;
