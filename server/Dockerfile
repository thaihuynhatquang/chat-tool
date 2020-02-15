FROM node:12-alpine
LABEL maintainer='thaihuynhatquang@gmail.com'

WORKDIR /app

COPY . /app
RUN yarn --loglevel=error

ENTRYPOINT ["chmod", "+x", "./wait-for-it.sh", "mysql:3306", "-t", "0", "--", "yarn", "start"]
