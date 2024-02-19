#!/bin/bash

DB_VARIANTS=("main" "develop")
PROJECTS_REQUIRING_DB=("hopbot")

create_database() {
    sudo_required
    local STORE_FOLDER
    STORE_FOLDER="/root/database"
    loginctl enable-linger "$USER"
    mkdir -p "$STORE_FOLDER/"{config,data}

    local DB_ROOT_PASS
    DB_ROOT_PASS=$(generate_password 32)
    local DB_PORT
    DB_PORT=$(shuf -n 1 -i 10000-65500)

    dump "PASSWD=$DB_ROOT_PASS" "conf"
    dump "PORT=$DB_PORT" "conf"

    ## Create init script and copy config
    cp "$PWD/confs/postgres.conf" "$STORE_FOLDER/config/postgres.conf"
    generate_init_script > "$STORE_FOLDER/config/init-user-db.sh"

    podman create \
        --tz=Europe/Paris \
        --name "database" \
        --publish "$DB_PORT:5432" \
        --volume "$STORE_FOLDER/config/postgres.conf:/etc/postgresql/postgres.conf:z" \
        --volume "$STORE_FOLDER/config/init-user-db.sh:/docker-entrypoint-initdb.d/init-user-db.sh:z" \
        --volume "$STORE_FOLDER/data:/var/lib/postgresql/data:z" \
        --env "POSTGRES_PASSWORD=$DB_ROOT_PASS" \
        "docker.io/library/postgres:16.1-alpine"

    # create the service file
    podman generate systemd \
        --new \
        --name "database" \
        --restart-policy "on-failure" \
        > "/etc/systemd/system/container-database.service"
    systemctl enable "container-database.service"
    systemctl daemon-reload
    systemctl start "container-database.service"
    echo "Deployed successfully"
}

generate_init_script() {
    cat <<EOF
#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
DROP DATABASE IF EXISTS postgres;
$(
    for project in "${PROJECTS_REQUIRING_DB[@]}"; do
        generate_project_info "$project"
    done
)
EOSQL
EOF
}

generate_project_info() {
    local project_name="$1"
    mkdir -p "$GENERATED_FOLDER/db"

    for variant in "${DB_VARIANTS[@]}"; do
        local USR
        USR="$(echo "$project_name" | tr '[:upper:]' '[:lower:]')_$variant"
        local PASS
        PASS="$(generate_password 32)"
        dump "$project_name-$variant - dbname=db-$USR user=$USR password=$PASS" "$project_name.conf"
        echo "CREATE USER $USR WITH PASSWORD '$PASS';"
        echo "CREATE DATABASE $USR;"
    done
}

dump() {
    mkdir -p "$GENERATED_FOLDER/db"
    echo "$1" >> "$GENERATED_FOLDER/db/$2"
}
