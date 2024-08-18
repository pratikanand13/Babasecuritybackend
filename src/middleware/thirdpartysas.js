const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const lrnuclei = async (req, res, next) => {
    try {
        const url = req.body.url;
        if(!url) { res.status(403).send("This feature is available only for live hosted links")}
        const tag = req.body.tag;
        const severity = req.body.severity;
        const wslDistribution = 'Ubuntu-22.04';
        const nucleiCommand1 = `nuclei -u ${url} `;
        const nucleiCommand2 = `nuclei -u ${url} -tags ${tag} `;
        const nucleiCommand3 = `nuclei -u ${url} -tags ${tag} -severity ${severity} `;
        const nucleiCommand4 = `nuclei -u ${url} -severity ${severity} `;
        
        let nucleiCommand; 
        
        if (req.body.severity && req.body.tag) {
            nucleiCommand = nucleiCommand3;
        } else if (req.body.severity) {
            nucleiCommand = nucleiCommand4;
        } else if (req.body.tag) {
            nucleiCommand = nucleiCommand2;
        } else {
            nucleiCommand = nucleiCommand1;
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
            console.log('WSL session started. Baba security is running nuclei scan...');
            wslProcess.stdin.write(` ${nucleiCommand}\n`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }
            const stdout = stdoutBuffer.join('')
            const extractedIssues = extractIssues(stdout)
            const stderr = stderrBuffer.join('')
            const terminalOut = stdout+stderr
            req.stdout = stdout
            req.extractedIssues = extractedIssues
            req.terminalOut = terminalOut
            next()
        });
    } catch (error) {
        res.status(403).send(error);
    }
}
module.exports = lrnuclei;
