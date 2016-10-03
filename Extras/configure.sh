#!/bin/sh
#PREREQS = "python python-dev perl python-pip build-essential checkinstall libssl-dev openssh-server git"
# NODE = "nodejs npm"
echo "Installing Prerequisites"
apt-get update # Fetches the list of available updates
apt-get upgrade -y # Strictly upgrades the current packages
apt-get dist-upgrade  # Installs updates (new ones)
#apt-get install -y $PREREQS # Install the packages
sudo apt-get install -y python python-dev perl python-pip build-essential checkinstall libssl-dev openssh-server git
# NODE.JS
# apt-get install -y $NODE # Install node.js
sudo apt-get install -y nodejs npm
sudo ln -s /usr/bin/nodejs /usr/bin/node # create a symbolic link for node.js
# MONGODB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927 # Import key
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list # Create a list file
sudo apt-get update # Update package
sudo apt-get install -y mongodb-org # Install the latest version of MongoDB
# Setup Mongo
## Create default db folder
sudo mkdir /data
sudo mkdir /data/db
sudo update-rc.d mongod defaults # Run mongod on system startup
# Setup OpenSSH
## Backup openssh config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.factory-defaults
sudo chmod a-w /etc/ssh/sshd_config.factory-defaults
# Config openssh
# sudo nano /etc/ssh/sshd_config
# sudo systemctl restart ssh
sudo update-rc.d mongod enable
# Placeholder to setup keys for ssh in the future
# https://help.ubuntu.com/community/SSH/OpenSSH/Configuring