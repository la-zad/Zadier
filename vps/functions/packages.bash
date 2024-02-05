#!/bin/bash

install_packages() {
    sudo_required
    if [ -z "$1" ]; then
        echo "No packages provided."
        exit 1
    fi
    dnf update -y
    dnf upgrade -y
    dnf install -y "$@"
}
