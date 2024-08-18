#!/bin/sh

# Start the Docker service
service docker start

# Run hakrawler container
docker run --rm -i hakluke/hakrawler --help

# Run nuclei container
docker run projectdiscovery/nuclei:latest

# Start the Node.js application
exec "$@"
