#!/bin/bash

exit_on_error() {
    echo "Error: $1"
    exit 1
}

source_env() {
    if [ -f "$1" ]; then
        # shellcheck disable=SC1090
        . "$1"
        return $?
    else
        exit_on_error "File not found: $1"
    fi
}

sudo_required() {
    [ "$(id -u)" -ne 0 ] && exit_on_error "This script must be run as root. Try 'sudo $0'"
}

sudo_forbidden() {
    [ "$(id -u)" -eq 0 ] && exit_on_error "This script must be run as a regular user. Try '$0'"
}
