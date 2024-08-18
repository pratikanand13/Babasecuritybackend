FROM nikolaik/python-nodejs

# Install Docker CLI in the container
RUN apt-get update && apt-get install -y \
    docker.io git curl python3-pip ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install npm dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install

# Install pip packages
RUN pip3 install watchdog

# Install Bearer directly from GitHub
RUN curl -L https://github.com/Bearer/bearer/releases/latest/download/bearer-linux-amd64 -o /usr/local/bin/bearer \
    && chmod +x /usr/local/bin/bearer

# Return to the app directory
WORKDIR /app

# Copy the remaining application files
COPY . .

# Expose the port for the application
EXPOSE 3000

# Set up Docker-in-Docker environment
VOLUME /var/lib/docker
ENV DOCKER_HOST=unix:///var/run/docker.sock

# Set up the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Define the entrypoint and the default command
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "dev"]
