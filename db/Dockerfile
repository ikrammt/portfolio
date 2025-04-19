FROM postgres:15.10-slim

ENV POSTGRES_DB=portfolio_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=1234

COPY ./portfolio_db.sql /docker-entrypoint-initdb.d/

EXPOSE 5432