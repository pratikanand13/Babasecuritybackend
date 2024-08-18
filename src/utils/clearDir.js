const fs = require('fs');
const path = require('path');

function removeFolder(folderPath) {
    try {
        // Remove the folder and all its contents
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Folder '${folderPath}' removed successfully.`);
    } catch (err) {
        console.error(`Error while removing folder '${folderPath}':`, err);
    }
}

module.exports = removeFolder
