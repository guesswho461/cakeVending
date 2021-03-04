#!/bin/sh

# install the node via the nvm
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
nvm install 13.8.0
sudo ln -s /home/pi/.nvm/versions/node/v13.8.0/bin/node /usr/bin/node
sudo ln -s /home/pi/.nvm/versions/node/v13.8.0/bin/npm /usr/bin/npm
