FROM node:15

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

USER node
COPY --chown=node:node . .
EXPOSE 3000

CMD [ "npm", "run", "prod" ]