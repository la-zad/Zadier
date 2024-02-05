#!/bin/bash

generate_password() {
    if [ -z "$1" ]; then
        echo "No length provided."
        exit 1
    fi
    openssl rand -base64 "$1"
}

create_user() {
    sudo_required
    local USR_HOME PASSWD
    if [ -z "$1" ]; then
        echo "No username provided."
        exit 1
    fi
    mkdir "$GENERATED_FOLDER/$1"

    PASSWD=$(generate_password 32)
    useradd -m -p "$PASSWD" "$1"
    USR_HOME="$(eval echo ~"$1")"

    echo "$PASSWD" >"$GENERATED_FOLDER/$1/passwd"
    echo "User $1 created."
    ## SSH
    mkdir -p "$USR_HOME/.ssh"
    ssh-keygen -t ed25519 -f "$GENERATED_FOLDER/$1/github" -C "coindesdev+$1@gmail.com" -N ""
    cat "$GENERATED_FOLDER/$1/github.pub" >> "$USR_HOME/.ssh/authorized_keys"
    chmod -R 600 "$USR_HOME/.ssh/authorized_keys"
    chown "$1:$1" "$USR_HOME/.ssh/authorized_keys"
    ## Podman
    runuser -u "$1" -- podman network create "$1"
}
