# Use an official Node.js runtime as a parent image
FROM node:16-bullseye

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install
RUN npm install -g @algolia/404-crawler

# Install required system dependencies for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libgbm1 \
    libasound2 \
    libcairo2 \
    libxcomposite1 \
    libxrandr2 \
    libxcursor1 \
    libdrm2 \
    libx11-6 \
    libxtst6 \
    libxrender1 \
    libdbus-1-3 \
    fonts-freefont-ttf

# Add Bearer repository and install Bearer
RUN echo "deb [trusted=yes] https://apt.fury.io/bearer/ /" | tee /etc/apt/sources.list.d/fury.list
RUN apt-get update && apt-get install -y bearer

# Install Nuclei
RUN apt-get install -y wget && \
    wget https://github.com/projectdiscovery/nuclei/releases/download/v2.9.8/nuclei_2.9.8_linux_amd64.zip && \
    unzip nuclei_2.9.8_linux_amd64.zip && \
    mv nuclei /usr/local/bin/ && \
    chmod +x /usr/local/bin/nuclei

# Install Playwright and its browsers
RUN npx playwright install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to start your Node.js application
CMD ["node", "app.js"]
