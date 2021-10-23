FROM node:16

WORKDIR /usr/src/wavdio-express/

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

EXPOSE 3000

ENV DB_URI mongodb://wavdio-mongo:27017/wavdio-express

CMD [ "node", "bin/server.js" ]
