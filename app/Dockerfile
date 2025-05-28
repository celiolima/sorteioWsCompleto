FROM node:14-alpine

#cria diretorio /app
WORKDIR /usr/app

#copia todos aquivos iniciando por package e terminamdo em .json e na pasta app para o diretorio criado
COPY package*.json ./

#instala as dependecias
RUN npm install 

#faz o bild da imagem
COPY . .

EXPOSE 3000
CMD ["npm" ,"start"]