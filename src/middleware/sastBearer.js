const { spawn } = require('child_process');

const sastBearer = async (req, res, next) =>{
    try{
        const githubLink = req.user.organisationgithuburl
        const githubName = req.user.organisationname
        const wslDistribution = 'Ubuntu-22.04'
        const gitClone = `git clone ${githubLink}`
        const bearerCommand = `bearer scan ${githubName}`
        const clonePath = `/mnt/c/Users/prati/infosec/backend/${githubName}`
        const deleteDir = `rm -rf ${githubName}`
        console.log(`Starting WSL session with distribution: ${wslDistribution}`);
        const wslProcess = spawn('wsl', ['-d', wslDistribution], { shell: true });

        let stdoutBuffer = [];
        let stderrBuffer = [];
        let dataCopyBuffer = [];
        wslProcess.stdout.on('data', (data) => {
            dataCopyBuffer.push(data)
            stdoutBuffer.push(data); 
            console.log(`WSL stdout (chunk received): ${data}`);
        });

        wslProcess.stderr.on('data', (data) => {
            
            stderrBuffer.push(data.toString());
            console.warn(`WSL stderr (possible warning/advice): ${data}`);
        });

        wslProcess.on('spawn', () => {
            console.log('WSL session started. Activating virtual environment and analysing your codebase...');
            wslProcess.stdin.write(`${gitClone} && ${bearerCommand} && ${deleteDir}\n`);
            wslProcess.stdin.end();
        });

        wslProcess.on('close', (code) => {
            if (code !== 1) {
                console.error(`WSL process exited with code ${code}`);
                return res.status(500).send('Error during WSL process execution');
            }
            const dataCopy = Buffer.concat(dataCopyBuffer).toString('utf8')
            const stdout = Buffer.concat(stdoutBuffer).toString('utf8') 
            const stderr = stderrBuffer.join('');
            console.log('Code reading completed successfully. Processing output...');
            console.log("Stdout", stdout);
            const severityEntries = stdout.split(/(CRITICAL:|HIGH:|MEDIUM:|LOW:)/).slice(1);
            const severityIssues = {};

            for (let i = 0; i < severityEntries.length; i += 2) {
            const label = severityEntries[i].trim();  // Severity level (e.g., CRITICAL, HIGH, etc.)
            const content = severityEntries[i + 1].trim();  // The content following the severity level
    
            // If the label doesn't exist in the severityIssues object, initialize it as an empty array
            if (!severityIssues[label]) {
            severityIssues[label] = [];
            }

    // Add the entire content block as a single string to the corresponding severity level
        severityIssues[label].push(content);
}

// Store the parsed data in req.scanResults
            req.scanResults = severityIssues;
            req.stdout = stdout;
            // console.log("scanres",req.scanResults)
            req.stderr = stderr;
            next(); 
        });

    } catch (error) {
        console.error('Error in webCrawling middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = sastBearer