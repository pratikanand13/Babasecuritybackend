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
    libatk-bridge2.0-0 \
    libgbm1 \
    libasound2 \
    libxshmfence1 \
    libxcomposite1 \
    libxrandr2 \
    libdbus-glib-1-2 \
    libgtk-3-0 \
    libcups2 \
    libdrm2 \
    libxdamage1 \
    libxkbcommon0 \
    libvpx6 \
    libevent-2.1-7 \
    libx11-xcb1 \
    libcairo2 \
    libgdk-pixbuf2.0-0 \
    libicu67 \
    libwoff1 \
    libopus0 \
    libjpeg62-turbo \
    libharfbuzz-icu0 \
    libenchant-2-2 \
    libsecret-1-0 \
    libhyphen0 \
    libflite1 \
    libegl1 \
    libglx0 \
    libgudev-1.0-0 \
    libffi7 \
    libevdev2 \
    libgles2 \
    libx264-160 \
    docker.io

# Add Bearer repository and install Bearer
RUN echo "deb [trusted=yes] https://apt.fury.io/bearer/ /" | tee /etc/apt/sources.list.d/fury.list
RUN apt-get update && apt-get install -y bearer

# Install Playwright and its browsers
RUN npx playwright install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Ensure entrypoint script has execution permissions
RUN chmod +x /usr/src/app/entrypoint.sh

# Define the entrypoint script as the container's entrypoint
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
