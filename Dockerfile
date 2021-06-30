FROM node:15.13.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . ./

EXPOSE 4500
CMD [ "node", "src/server.js", "-p", "4500" ]