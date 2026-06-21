# Estágio de Build
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Build do bundle de produção do React
RUN npm run build

# Estágio de Execução com Nginx
FROM nginx:alpine

# Copiar os arquivos gerados no build para o diretório padrão do Nginx
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copiar arquivo de configuração personalizada para rotas do React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Porta em que o Nginx expõe o site
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
