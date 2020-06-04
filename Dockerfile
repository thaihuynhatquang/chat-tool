FROM node:10.15-alpine
LABEL maintainer='thaihuynhatquang@gmail.com'

WORKDIR /app

RUN apk update && \
  apk upgrade && \
  apk add bash && \
  npm install yarn -g && \
  npm install pm2 -g

RUN yarn --cwd /app

COPY . /app

ENTRYPOINT ["./wait-for-it.sh", "mysql:3306", "-t", "0", "--", "yarn", "start"]
