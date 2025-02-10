FROM node:23.7

WORKDIR /app

COPY . . 

RUN npm install

ENV DB_HOST =

ENV DB_USER =

ENV DB_PASSWORD = 

ENV port=3000

EXPOSE 3000

CMD ["npm", "start"]