const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '../logs');
const logFile = path.join(logDir, 'api-logs.log'); 
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logMiddleware = (req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;
    const chunks = [];

    res.write = function (chunk) {
        chunks.push(Buffer.from(chunk));
        oldWrite.apply(res, arguments);
    };

    res.end = function (chunk) {
        if (chunk) {
            chunks.push(Buffer.from(chunk));
        }
        const body = Buffer.concat(chunks).toString('utf8');
        const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const logData = `${clientIp} - - [${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false })}] "${req.method} ${req.originalUrl} HTTP/${req.httpVersion}" \n`;
        fs.appendFile(logFile, logData, (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
            } else {
                console.log('Log successfully written to file');
            }
        });

        oldEnd.apply(res, arguments);
    };

    next();
};

module.exports = logMiddleware;
