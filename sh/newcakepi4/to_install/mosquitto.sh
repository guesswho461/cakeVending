#!/bin/sh

CFG_DIR_DST=/etc/mosquitto/conf.d
CFG_FILE_SRC=./mosquitto/default.conf

# install the mosquitto
sudo apt -y install mosquitto
# config the mosquitto
[ ! -d $CFG_DIR_DST ] && sudo mkdir -p $CFG_DIR_DST
if [ -f $CFG_FILE_SRC ]; then
  sudo cp $CFG_FILE_SRC $CFG_DIR_DST
else
  echo "error: mosquitto cfg file is not exists"
fi
