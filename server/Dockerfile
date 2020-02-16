FROM node:12-alpine
LABEL maintainer='thaihuynhatquang@gmail.com'

RUN apk update && apk add vim && apk add bash

WORKDIR /app

COPY . /app
RUN yarn --loglevel=error

CMD yarn start
