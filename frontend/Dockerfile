FROM node:18-alpine

WORKDIR /app

EXPOSE 3000

COPY package.json package-lock.json ./

RUN npm install -g npm@9.8.1 --silent

COPY . ./

CMD ["npm", "run", "dev", "--reload"]