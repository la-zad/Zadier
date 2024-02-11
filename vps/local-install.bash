#!/bin/bash

PWD="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

source_env() {
    if [ -f "$1" ]; then
        # shellcheck disable=SC1090
        . "$1"
        return $?
    else
        echo "File not found: $1"
        exit 1
    fi
}

## expect the following variables:
# IP
source_env "$PWD"/.env
if [ -z "$IP" ]; then
    echo "IP not provided."
    exit 1
fi

## cleanup
find "$PWD"/generated -type f -not -name '.gitkeep' -delete
ssh "almalinux@$IP" <<EOF
    sudo rm -rf /home/almalinux/{vps-install,.ssh}
EOF

## Ensure files are executable
chmod +x "$PWD"/install.bash

## copy files
scp -r "$PWD"/ "almalinux@$IP:/home/almalinux/vps-install"

## run remote script
ssh "almalinux@$IP" <<EOF
    cd /home/almalinux/vps-install
    sudo ./install.bash
EOF

## download generated files
scp -r "almalinux@$IP:/home/almalinux/vps-install/generated" "$PWD"

## ask to reboot
read -rp "Reboot now? [y/N] " REBOOT
if [[ "$REBOOT" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Rebooting..."
    ssh "almalinux@$IP" <<EOF
        rm -rf /home/almalinux/vps-install/generated
        sudo reboot
EOF
else
    echo "Reboot skipped. Please reboot manually and clean the '~/vps-install/generated' directory."
fi
exit 0
