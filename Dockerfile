# syntax = docker/dockerfile:1.4.0

FROM node:20.10.0-alpine3.19

ENV APP_ROOT /app
ENV APP_PORT 80

RUN mkdir $APP_ROOT && chown -R node:node $APP_ROOT
WORKDIR $APP_ROOT

COPY --chown=node:node ./application/package.json ./application/yarn.lock ./
COPY --chown=node:node ./application/src ./src

RUN yarn install --production --frozen-lockfile && \
    yarn cache clean

USER node

CMD yarn start
EXPOSE ${APP_PORT}