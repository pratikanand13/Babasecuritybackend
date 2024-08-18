const fs = require('fs').promises;
const path = require('path');

const clearDir = async (name) => {
    const dirPath = path.resolve(__dirname, '../../', name); 
    try {
        const dirExists = await fs.stat(dirPath);

        if (dirExists) {
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                const currentPath = path.join(dirPath, file);
                const stats = await fs.lstat(currentPath);

                if (stats.isDirectory()) {
                    await clearDir(currentPath);
                } else {
                    await fs.unlink(currentPath);
                }
            }
            await fs.rmdir(dirPath);  
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`Directory not found: ${dirPath}`);
        } else {
            console.error(`Error clearing directory: ${error.message}`);
        }
    }
};

module.exports = clearDir;
