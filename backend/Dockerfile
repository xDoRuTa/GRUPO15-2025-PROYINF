FROM node:18

WORKDIR /usr/src/app/backend

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

CMD ["node", "index.js"]