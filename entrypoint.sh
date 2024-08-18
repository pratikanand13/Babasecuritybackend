#!/bin/bash

# Start the Node.js application
node app.js &

# Run the Nuclei Docker image with any necessary arguments
docker run --rm projectdiscovery/nuclei:latest nuclei -v

# Wait for all background processes to complete
wait