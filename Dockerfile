# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
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
