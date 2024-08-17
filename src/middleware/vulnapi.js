const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const htmlparse = async (req, res, next) => {
    try {
        const url = req.body.url;
        const wslDistribution = 'Ubuntu-22.04';
        const vulnApiScript = `vulnapi scan curl ${url}`;
        const ansiRegex = (await import('ansi-regex')).default;
        console.log(`Starting WSL session with distribution: ${wslDistribution}`);
        const wslProcess = spawn('wsl', ['-d', wslDistribution], { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];

        wslProcess.stdout.on('data', (data) => {
            stdoutBuffer.push(data);
            console.log(`WSL stdout (chunk received): ${data}`);
        });

        wslProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`WSL stderr (possible warning/advice): ${data}`);
        });

        wslProcess.on('spawn', () => {
            console.log('WSL session started. Activating virtual environment and running vulnapi scan...');
            wslProcess.stdin.write(`${vulnApiScript}\n`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', async (code) => {
            if (code !== 0) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }
            const stdout = Buffer.concat(stdoutBuffer).toString('utf8').replace(ansiRegex(), '');
            const stderr = stderrBuffer.join('');
            req.headers['stdout'] = stdout;
            req.headers['stderr'] = stderr;
            next(); 
        });

    } catch (error) {
        console.error('Error in htmlparse middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = htmlparse;
