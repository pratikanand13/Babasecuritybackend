const fs = require('fs').promises;
const path = require('path');

const clearDir = async (name) => {
    const dirPath = path.resolve(__dirname, '../../', name); // Adjust the path as needed
    try {
        // Check if the directory exists
        const dirExists = await fs.stat(dirPath);

        if (dirExists) {
            const files = await fs.readdir(dirPath);

            // Iterate over each file/directory in the directory
            for (const file of files) {
                const currentPath = path.join(dirPath, file);
                const stats = await fs.lstat(currentPath);

                if (stats.isDirectory()) {
                    // Recursively delete directories
                    await clearDir(currentPath);
                } else {
                    // Delete files
                    await fs.unlink(currentPath);
                }
            }

            // Finally, remove the empty directory
            await fs.rmdir(dirPath);
            console.log(`Directory deleted: ${dirPath}`);
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
