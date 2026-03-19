FROM node:22.12.0-alpine

WORKDIR /app

COPY package.json ./
COPY server/package.json server/

COPY . .

RUN npm install && npm run build && cd server && npm install

EXPOSE 3000

CMD ["node", "server/index.js"]
