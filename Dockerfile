# syntax=docker/dockerfile:1
# Nota (2026-09-07): achado real rodando docker compose build local depois da extração do
# @williamsilva/nimbus-web-commons - "npm error 401 Unauthorized ... authentication token not
# provided" no `npm ci`. O .npmrc do projeto (@williamsilva:registry=npm.pkg.github.com +
# _authToken=${NODE_AUTH_TOKEN}) precisa estar copiado ANTES do npm ci rodar, e NODE_AUTH_TOKEN
# precisa virar variável de ambiente de verdade (ARG sozinho não basta - não é lido por processos
# filhos, só pelas instruções do próprio Dockerfile) - mesmo achado/mesmo padrão ARG do backend
# (Maven) pro GITHUB_ACTOR/GITHUB_TOKEN, ver Dockerfile do CardsyncServer.
FROM node:22-alpine AS build
WORKDIR /workspace
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# development (não production): environment.prod.ts aponta pro domínio real
# (https://api.cardsync.com.br), inexistente neste setup local - environment.ts (usado pela
# config "development", sem fileReplacement) já aponta pro CardsyncServer local
# (http://localhost:9091), que é o que faz sentido rodando via docker compose no host dev.
RUN npm run build -- --configuration development

FROM nginx:1.27-alpine
COPY --from=build /workspace/dist/cardsync/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
