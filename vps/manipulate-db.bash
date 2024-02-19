#!/bin/bash

# TODO: WIP

##############################################
## This scripts connects to the VPS via SSH ##
## and dumps the database to a local file,   ##
## or restores the database from a local    ##
## file.                                     ##
##############################################

## expect the following variables:
# IP: IP address of the VPS
# PORT: SSH Port (default: 22)
# DB_HOSTNAME: name of the pod running the database (default: cdd-db)
# DB_USER
# DB_PASSWORD
# DB_NAME
# DB_PORT
source_env "$PWD"/.env

START_TIME="$(date +%s)"

if [ -z "$IP" ]; then
    echo "IP not provided."
    exit 1
fi
if [ -z "$PORT" ]; then
    PORT="22"
fi
if [ -z "$DB_HOSTNAME" ]; then
    DB_HOSTNAME="cdd-db"
fi
if [ -z "$DB_USER" ]; then
    echo "DB_USER not provided."
    exit 1
fi
if [ -z "$DB_PASSWORD" ]; then
    echo "DB_PASSWORD not provided."
    exit 1
fi
if [ -z "$DB_NAME" ]; then
    echo "DB_NAME not provided."
    exit 1
fi
if [ -z "$DB_PORT" ]; then
    DB_PORT="3306"
fi

show_help() {
    echo "
  Usage: ${0##*/} [-h] [-r] [-d] [FILE]

    Manage the CDD database.

    -h, --help      display this help and exit
    -r, --restore   restore the database from a dump
    -d, --dump      dump the database to a file
    "
}

dump() {
    # shellcheck disable=SC2087 # intentionnal
    ssh "almalinux@$IP" -p "$PORT" <<EOF
        podman exec -i "$DB_HOSTNAME" pg_dump -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -f /tmp/DB_DUMP_$START_TIME.sql
EOF
    scp -P "$PORT" "almalinux@$IP:/tmp/DB_DUMP_$START_TIME.sql" "$1"
}

restore() {
    scp -P "$PORT" "almalinux@$1" "$IP:/tmp/DB_DUMP_$START_TIME.sql"
    # shellcheck disable=SC2087 # intentionnal
    ssh "almalinux@$IP" -p "$PORT" <<EOF
        podman exec -i "$DB_HOSTNAME" psql -U "$DB_USER" -d "$DB_NAME" -p "$DB_PORT" -f /tmp/DB_DUMP_$START_TIME.sql
EOF
}

while :; do
    case "$1" in
        -h|--help|-\?) show_help; exit 0 ;;
        -r|--restore) restore "$2"; exit $? ;;
        -d|--dump) dump "$2"; exit $? ;;
        --) shift; break ;;
        -?*) echo "invalid option: $1" 1>&2; show_help; exit 1 ;;
        *) echo "invalid argument: $1" 1>&2; show_help; exit 1 ;;
    esac
done