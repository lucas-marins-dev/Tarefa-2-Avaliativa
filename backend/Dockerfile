FROM node:20-alpine

# Definição do diretório de trabalho
WORKDIR /usr/src/app

# Cópia dos arquivos de dependência
COPY package*.json ./

# Instalação das dependências
RUN npm install

# Cópia do restante do código-fonte da aplicação
COPY . .

# Exposição da porta padrão da API
EXPOSE 3000

# Execução do servidor
CMD ["npm", "start"]
