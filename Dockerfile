FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY server/package.json server/
RUN npm install --no-optional && npm run build && cd server && npm install --no-optional

COPY . .
EXPOSE 3000

CMD ["node", "server/index.js"]
