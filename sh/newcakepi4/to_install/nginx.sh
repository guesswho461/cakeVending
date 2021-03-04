#!/bin/sh

CFG_DIR_DST=/etc/nginx/sites-available/
CFG_FILE_SRC=./nginx/default

# install the nginx
sudo apt -y install nginx
# config the nginx
[ ! -d $CFG_DIR_DST ] && sudo mkdir -p $CFG_DIR_DST
if [ -f $CFG_FILE_SRC ]; then
  sudo cp $CFG_FILE_SRC $CFG_DIR_DST
else
  echo "error: nginx cfg file is not exists"
fi
