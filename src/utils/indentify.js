async function storeLinksAndData(inputString) {
    const result = {
        links: [],
        data: []
    };
  
    // Split the input string into lines
    const lines = inputString.split('\n');
  
    // Iterate over each line
    lines.forEach(line => {
        // Trim any white space
        line = line.trim();
  
        // Check if the line contains a URL or base64 data
        if (line.startsWith('https://')) {
            result.links.push(line);
        } else if (line.startsWith('data:application/x-javascript;')) {
            result.data.push(line);
        }
    });
  
    // Example usage of storing result under a key called 'links'
    const storageObject = { links: result };
    console.log(storageObject);
  
    return storageObject;
  }

module.exports =  storeLinksAndData 