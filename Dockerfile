# syntax=docker/dockerfile:1.5
FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json .npmrc ./
# --mount=type=secret: o arquivo só existe em /run/secrets/node_auth_token durante este RUN,
# nunca gravado em nenhuma camada da imagem nem visível em `docker history`/build logs -
# diferente de ARG/--build-arg, que fica exposto em texto puro no log de build (achado real
# 2026-09-07/2026-09-11: GITHUB_TOKEN vazou assim num log de build redirecionado a arquivo).
# `env=` (que injetaria direto como variável de ambiente, sem o export manual abaixo) não é
# suportado nesta versão de syntax do BuildKit ("unexpected key 'env'") - lê do arquivo montado
# e exporta manualmente antes do npm ci em vez disso. Causa raiz real do 401 (achado real
# 2026-09-11, 2 problemas empilhados): (1) o .npmrc do projeto - que diz pro npm usar
# npm.pkg.github.com com autenticação pro escopo @williamsilva - só era copiado DEPOIS do `npm
# ci` (no `COPY . .` seguinte), então o npm rodava sem NENHUMA config de auth pra esse registry,
# token certo ou não; corrigido copiando .npmrc junto com package.json/package-lock.json, antes
# do npm ci. (2) o Dockerfile também nunca declarava `ARG NODE_AUTH_TOKEN` - o build-arg que o
# docker-compose.yml já passava nunca virava variável de ambiente disponível pro processo, daí o
# secret mount abaixo em vez de ARG/--build-arg (mais seguro de qualquer forma, ver acima).
RUN --mount=type=secret,id=node_auth_token \
    export NODE_AUTH_TOKEN="$(cat /run/secrets/node_auth_token)" && npm ci
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
