FROM node:16 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

RUN apt-get update && apt-get install -y python3-pip
RUN pip3 install watchdog

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
