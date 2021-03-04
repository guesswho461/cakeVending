#!/bin/sh

DIR="./to_install"
LAST_DIR=$(pwd)

# update the source
echo "update the source list"
sudo apt update

if [ -d $DIR ]; then

  cd $DIR
  for f in *.sh; do
    echo "$f installing..."
    bash "$f"
  done
  
  cd $LAST_DIR

  bash app.sh
  
  sudo reboot
else
    echo "error: could not find anythings to install"
fi
