FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

RUN npm run build:prod

CMD ["npm", "run", "start"]