ARG NODE_VERSION=22.9.0

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV=development
ENV CACHE_DIR="/usr/src/cache"
ENV APP_DIR="/usr/src/app"

WORKDIR ${CACHE_DIR}

COPY package*.json ./

RUN npm install

WORKDIR ${APP_DIR}

COPY . .

ENTRYPOINT ["./start.sh"]
