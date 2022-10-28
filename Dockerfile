
# Dockerfile for NextJS with Prism
FROM node:18-alpine as install

WORKDIR /usr/app

COPY ./package.json ./package-lock.json ./
COPY ./prisma ./prisma/

RUN npm i --silent

RUN npm run prisma\:generate


COPY . .
#
FROM node:18-alpine as develop


# Create and change into a directory in the container
WORKDIR /usr/app

COPY --from=install /usr/app/. .
COPY --from=install /usr/app/node_modules ./node_modules

COPY . .

RUN npm run prisma\:generate
