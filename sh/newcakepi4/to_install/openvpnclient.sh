#!/bin/sh

CFG_DIR_DST=/etc/openvpn
CFG_FILE_SRC=./openvpn/client.conf

# install the openvpn
sudo apt -y install openvpn
# config the openvpn
[ ! -d $CFG_DIR_DST ] && sudo mkdir -p $CFG_DIR_DST
if [ -f $CFG_FILE_SRC ]; then
  sudo cp $CFG_FILE_SRC $CFG_DIR_DST
else
  echo "error: openvpn client cfg file is not exists"
fi
