FROM node:16

WORKDIR /usr/src/wavdio-express/

COPY package.json package-lock.json ./

RUN npm ci

COPY ./ ./

EXPOSE 3000

CMD [ "node", "bin/server.js" ]
