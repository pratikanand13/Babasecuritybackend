# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install system dependencies
RUN apt-get update && apt-get install -y \
    apt-transport-https \
    libxcursor1 \
    libxdamage1 \
    libgtk-3-0 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo-gobject2 \
    libcairo2 \
    libgdk-pixbuf2.0-0  # Corrected package name

# Placeholder: Install vulnapi (alternative method)
# For example, if vulnapi provides a direct download, you can use:
# RUN curl -L -o /usr/local/bin/vulnapi https://vulnapi.example.com/download/latest && chmod +x /usr/local/bin/vulnapi

# Add Bearer repository and install Bearer
RUN echo "deb [trusted=yes] https://apt.fury.io/bearer/ /" | tee /etc/apt/sources.list.d/fury.list
RUN apt-get update && apt-get install -y bearer

# Install Playwright dependencies and Playwright itself
RUN npx playwright install-deps
RUN npx playwright install

# Pull the latest Nuclei Docker image
RUN docker pull projectdiscovery/nuclei:latest

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Copy custom entrypoint script
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

# Define the entrypoint script as the container's entrypoint
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
