FROM node:18

WORKDIR /app

COPY server/package.json server/
RUN cd server && npm install --no-optional

COPY . .
EXPOSE 3000

CMD ["node", "server/index.js"]
