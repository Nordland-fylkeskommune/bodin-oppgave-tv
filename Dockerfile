FROM node:18 

ENV PORT 3000

RUN mkdir -p /usr/src/bodintv/app
WORKDIR /usr/src/bodintv/app

COPY package*.json /usr/src/bodintv/app
RUN npm install

COPY . /usr/src/bodintv/app

RUN npm run build
EXPOSE 3000

CMD "npm" "run" "dev"

