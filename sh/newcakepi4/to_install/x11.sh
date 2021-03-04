#!/bin/sh

# install the x11 and chromium
sudo apt -y install --no-install-recommends xserver-xorg
sudo apt -y install --no-install-recommends xinit
sudo apt -y install --no-install-recommends x11-xserver-utils
sudo apt -y install chromium-browser
sudo apt -y install matchbox-window-manager xautomation unclutter
