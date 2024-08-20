
# BabaSecurity Dashboard

The BabaSecurity dashboard is designed to manage and monitor API security vulnerabilities within an enterprise, integrating seamlessly into the Software Development Life Cycle (SDLC) and providing real-time updates and monitoring.

## Accessing the Dashboard Online

Access the BabaSecurity dashboard online at: [BabaSecurity Dashboard](https://baba-frontend.vercel.app/)

## Running the Backend Locally

### Using Docker

1. Pull the backend Docker image:
   ```
   docker pull praatikzz/babasecurity:backend
   ```
2. Run the backend on port 3000:
   ```
   docker run -p 3000:3000 --name babasecuritybackend praatikzz/babasecurity:backend
   ```

### From GitHub

1. Clone the backend repository:
   ```
   git clone https://github.com/pratikanand13/Babasecuritybackend.git
   ```
2. Install the necessary dependencies:
   ```
   npm i
   ```
3. Run the backend server:
   ```
   npm run dev
   ```

## Running the Frontend Locally

1. Clone the frontend repository:
   ```
   git clone https://github.com/Ravi022/Baba_Frontend
   ```
2. Install the necessary dependencies:
   ```
   npm i
   ```
3. Run the frontend server:
   ```
   npm run dev
   ```

## API Routes

- POST /user/login
- POST /user/signup
- GET /apiDiscover
- GET /apilinks
- GET /bearer
- POST /nuclei
- POST /thirdpartySast

## API Inventory Management

### Overview

The API Inventory Management system automatically discovers and inventories all APIs within an organization, providing continuous updates and real-time monitoring.

### Features

- **Automatic API Discovery:** Continuously scans for new APIs using server logs and web crawlers.
- **Real-Time Monitoring:** Provides instant alerts for newly discovered APIs.
- **Integration into SDLC:** Ensures that the API inventory is up-to-date at every stage of the development process.

### Tools and Components

1. **Server Log Analysis**
   - Analyzes server logs to identify new API endpoints.
   - Provides detailed metrics, including response times and error rates.

2. **Web Crawler - 404 Crawler**
   - Identifies APIs by crawling the web application and recording any endpoints that return a 404 error.
   - Installation:
     ```
     npm install -g @algolia/404-crawler
     ```

## OWASP Top 10 API Attacks Coverage

### Tools and Components

1. **SAST Scanner - Bearer CLI**
   - Installation:
     ```
     curl -sfL https://raw.githubusercontent.com/Bearer/bearer/main/contrib/install.sh | sh
     ```

2. **DAST Scanner - VulnAPI**
   - Installation:
     ```
     sudo snap install vulnapi
     ```

3. **Automated Regression Suites - Nuclei**
   - Installation:
     ```
     docker pull projectdiscovery/nuclei:latest
     ```

## Architecture and Design Decisions

This section provides a detailed overview of the architectural design and key design decisions behind the Baba Security Dashboard.

### Schema Design

- **Record Schema:** Stores details about security vulnerabilities identified in APIs.
- **Scan Result Schema:** Records detailed scan results associated with a specific organization.
- **Dashboard Schema:** Manages user authentication and stores user-related information for dashboard access.
- **API Store Schema:** Serves as a central repository for storing and retrieving API details linked with identified vulnerabilities.

### Security Measures

- **Authentication and Password Security:** Uses JWT for authentication and bcrypt for password hashing.
- **Regular Updates:** Ensures middleware and dependencies are regularly updated to mitigate vulnerabilities.

## Conclusion

The Baba security dashboard integrates various technologies to deliver a robust solution for managing and assessing security vulnerabilities. Its modular architecture supports scalability and adaptability to emerging security challenges.

