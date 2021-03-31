FROM node:15 as build

RUN mkdir /app
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------------

FROM node:15-slim

RUN mkdir /app
WORKDIR /app
COPY --from=build /app /app

EXPOSE 3000

CMD [ "node", "./build/src/index.js" ]