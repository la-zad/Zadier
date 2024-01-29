#!/bin/bash

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

exit_on_error() {
    echo "Error: $1"
    exit 1
}

install_packages() {
    if [ -z "$1" ]; then
        echo "No packages provided."
        exit 1
    fi
    dnf update -y
    dnf upgrade -y
    dnf install -y "$@"
}

generate_password() {
    if [ -z "$1" ]; then
        echo "No length provided."
        exit 1
    fi
    openssl rand -base64 "$1"
}

create_user() {
    local USR_HOME
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
    chown "$1":"$1" "$USR_HOME/.ssh/authorized_keys"
    ## Podman
    runuser -u "$1" -- podman network create "$1"
}

PWD="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
USR_HOME="$(eval echo ~"$SUDO_USER")"
GENERATED_FOLDER="$PWD/generated"

echo "
    #########################################
    #                                       #
    #      CDD VPS INSTALLATION SCRIPT      #
    #                                       #
    #########################################
    PWD: $PWD
    USR_HOME: $USR_HOME
    GENERATED_FOLDER: $GENERATED_FOLDER
"

# Check for root privileges
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root. Please use sudo."
    exit 1
fi

################################# Environment #################################
echo "Loading environment variables from .env file..."
# ###### Needed environment variables ######
# ## 1. ...                               ##
# ##########################################
# # Load environment variables
# # if .env file is not present, exit on failure
source_env "$PWD/.env" || exit_on_error "Failed to load environment variables."
echo "Environment variables loaded."
################################ Update System ################################
echo "Updating system..."
echo "Installing Epel repository..."
install_packages epel-release
install_packages podman htop firewalld rsync
echo "Minimal packages installed."
############################### Additionnal Users #############################
echo "Creating additional users..."
create_user "hopbot"
################################## SSH Setup ##################################
echo "Configuring SSH..."
## Generate SSH key
echo "Generating SSH key..."
## Add authorized keys
echo "Adding authorized keys..."
mkdir -p "$USR_HOME/.ssh"
for key in "$PWD"/ssh-keys/*; do
    echo "Adding key: $key"
    cat "$key" >> "$USR_HOME/.ssh/authorized_keys"
done
chmod -R 600 "$USR_HOME/.ssh/"*
chown -R "$SUDO_USER":"$SUDO_USER" "$USR_HOME/.ssh"

## Hardening SSH
echo "Hardening SSH..."
RDM_SSH_PORT=$(shuf -n 1 -i 10000-65500)
echo "$RDM_SSH_PORT" > "$PWD/generated/ssh-port"

sed -i "s/#Port 22/Port $RDM_SSH_PORT/g" /etc/ssh/sshd_config
sed -i "s/#AddressFamily any/AddressFamily inet/g" /etc/ssh/sshd_config
sed -i "s/#MaxAuthTries 6/MaxAuthTries 3/g" /etc/ssh/sshd_config
sed -i "s/#MaxSessions 10/MaxSessions 2/g" /etc/ssh/sshd_config
sed -i "s/#MaxStartups 10:30:100/MaxStartups 3:50:3/g" /etc/ssh/sshd_config
sed -i "s/#LogLevel INFO/LogLevel VERBOSE/g" /etc/ssh/sshd_config
sed -i "s/#TCPKeepAlive yes/TCPKeepAlive yes/g" /etc/ssh/sshd_config
sed -i "s/#PasswordAuthentication yes/PasswordAuthentication no/g" /etc/ssh/sshd_config
sed -i "s/#PermitEmptyPasswords no/PermitEmptyPasswords no/g" /etc/ssh/sshd_config
sed -i "s/#PermitRootLogin prohibit-password/PermitRootLogin no/g" /etc/ssh/sshd_config
############################# Additionnal Settings ############################
echo "Configuring additional settings..."
## Hostname
hostnamectl set-hostname "CDD-VPS"
## Ask for password when invoking sudo
echo "Configuring sudo..."
rm -f /etc/sudoers.d/90-cloud-init-users
sed -i 's/NOPASSWD: //g' /etc/sudoers
## Disable IPv6
echo "net.ipv6.conf.all.disable_ipv6=1" >> /etc/sysctl.conf
################################# Firewall Setup ##############################
echo "Configuring firewall..."
systemctl enable firewalld
systemctl start firewalld
firewall-cmd --permanent --remove-service=ssh
firewall-cmd --permanent --add-port="$RDM_SSH_PORT/tcp"
######################## Ensure files are downloadable ########################
echo "Ensuring files are downloadable..."
chmod -R 777 "$GENERATED_FOLDER"
