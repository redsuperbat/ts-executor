FROM node:latest as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:latest as runner

WORKDIR /app

RUN npm install -g zx

COPY --from=builder /app/node_modules node_modules

COPY --from=builder /app/index.js index.js

CMD [ "node", "index.js" ]