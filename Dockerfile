# syntax = docker/dockerfile:1.4.0

FROM node:20.10.0-alpine3.19

ENV APP_ROOT /app
ENV APP_PORT 80

RUN mkdir $APP_ROOT
WORKDIR $APP_ROOT

COPY --chown=www-data:www-data ./application ${APP_ROOT}

RUN yarn install

CMD yarn start
EXPOSE ${APP_PORT}