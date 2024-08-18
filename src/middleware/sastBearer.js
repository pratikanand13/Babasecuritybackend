const { spawn } = require('child_process');

const sastBearer = async (req, res, next) => {
    try {
        const githubLink = req.user.organisationgithuburl;
        const githubName = req.user.organisationname;
        const gitClone = `git clone ${githubLink}`;
        const bearerCommand = `bearer scan ${githubName}`;
        console.log(`Cloning repository: ${githubLink}`);
        const process = spawn(`${gitClone} && ${bearerCommand}`, { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];
        let dataCopyBuffer = [];

        process.stdout.on('data', (data) => {
            dataCopyBuffer.push(data);
            stdoutBuffer.push(data);
            console.log(`stdout (chunk received): ${data}`);
        });

        process.stderr.on('data', (data) => {
            stderrBuffer.push(data.toString());
            console.warn(`stderr (possible warning/advice): ${data}`);
        });

        process.on('close', (code) => {
            if (code !== 1) {
                console.error(`Process exited with code ${code}`);
                return res.status(500).send('Error during process execution');
            }
            const dataCopy = Buffer.concat(dataCopyBuffer).toString('utf8');
            const stdout = Buffer.concat(stdoutBuffer).toString('utf8');
            const stderr = stderrBuffer.join('');
            console.log('Code reading completed successfully. Processing output...');
            const termOut = stderr + dataCopy;
            const severityEntries = stdout.split(/(CRITICAL:|HIGH:|MEDIUM:|LOW:)/).slice(1);
            const severityIssues = {};

            for (let i = 0; i < severityEntries.length; i += 2) {
                const label = severityEntries[i].trim();
                const content = severityEntries[i + 1].trim();
                if (!severityIssues[label]) {
                    severityIssues[label] = [];
                }
                severityIssues[label].push(content);
            }

            req.termOut = termOut;
            req.severityIssues = severityIssues;
            req.stdout = stdout;
            req.stderr = stderr;
            next();
        });

    } catch (error) {
        console.error('Error in sastBearer middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = sastBearer;
