FROM node:12-alpine
LABEL maintainer='thaihuynhatquang@gmail.com'

RUN apk update && apk add vim && apk add bash

WORKDIR /app

RUN npm install --loglevel=error

COPY . /app

CMD npm start
