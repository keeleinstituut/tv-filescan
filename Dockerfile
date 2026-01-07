# syntax = docker/dockerfile:1.4.0

FROM node:20.10.0-alpine3.19

ENV APP_ROOT /app
ENV APP_PORT 80

RUN mkdir $APP_ROOT
WORKDIR $APP_ROOT

COPY ./application/package.json ./application/yarn.lock ./

RUN yarn install --production

COPY ./application .

RUN chown -R root:root ${APP_ROOT} && \
    chmod -R 755 ${APP_ROOT}

USER node

CMD yarn start
EXPOSE ${APP_PORT}