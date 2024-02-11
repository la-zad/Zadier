#!/bin/bash

PWD="$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
USR_HOME="$(eval echo ~"$SUDO_USER")"
GENERATED_FOLDER="$PWD/generated"

##### Sourcing required files #####
# shellcheck source=./vps/functions/utils.bash
. "$PWD/functions/utils.bash"
# shellcheck source=./vps/functions/user.bash
. "$PWD/functions/user.bash"
# shellcheck source=./vps/functions/packages.bash
. "$PWD/functions/packages.bash"

sudo_required

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
