#!/bin/bash
set -e

# Create the database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "myuser" --dbname "mydb" <<-EOSQL
    CREATE DATABASE mydb;
EOSQL
