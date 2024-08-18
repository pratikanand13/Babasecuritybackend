const { spawn } = require('child_process');

const htmlparse = async (req, res, next) => {
    try {
        const url = req.body.url;
        const vulnApiScript = `vulnapi scan curl ${url}`;
        const ansiRegex = (await import('ansi-regex')).default;

        console.log('Starting vulnapi scan command...');
        const vulnApiProcess = spawn(vulnApiScript, { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];

        vulnApiProcess.stdout.on('data', (data) => {
            stdoutBuffer.push(data);
            console.log(`vulnapi stdout (chunk received): ${data}`);
        });

        vulnApiProcess.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`vulnapi stderr (possible warning/advice): ${data}`);
        });

        vulnApiProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`vulnapi process exited with code ${code}`);
                return res.status(500).send('Error during vulnapi process execution');
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
