FROM node:23.11-slim

WORKDIR /app

COPY . . 

RUN npm install

ENV DB_HOST=pf_db

ENV DB_USER=postgres

ENV DB_PASSWORD=1234

ENV DB_NAME=portfolio_db

ENV DB_PORT=5433

ENV port=3000 

EXPOSE 3000

CMD ["npm", "start"] 