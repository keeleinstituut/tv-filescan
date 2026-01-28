# syntax = docker/dockerfile:1.4.0

FROM node:20.19.6-alpine3.23

ENV APP_ROOT /app
ENV APP_PORT 80

RUN mkdir $APP_ROOT
WORKDIR $APP_ROOT

COPY --chown=www-data:www-data ./application ${APP_ROOT}

RUN yarn install

CMD yarn start
EXPOSE ${APP_PORT}