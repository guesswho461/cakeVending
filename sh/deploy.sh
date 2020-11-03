#!/bin/sh

case $2 in
frontend)
  tar zcvf fw.tar.gz ../ui2/frontend/build
  ;;
backend)
  tar zcvf fw.tar.gz ../ui2/backend/index.js ../ui2/backend/package.json
  ;;
backendgpio)
  tar zcvf fw.tar.gz ../ui2/backendgpio/index.js ../ui2/backendgpio/A4988.js ../ui2/backendgpio/package.json
  ;;
all)
  tar zcvf fw.tar.gz ../ui2/frontend/build ../ui2/backend/index.js ../ui2/backend/package.json ../ui2/backendgpio/index.js ../ui2/backendgpio/A4988.js ../ui2/backendgpio/package.json
  ;;
*)
  echo "unknown command"
  ;;
esac

echo "copy fw to machine"
scp fw.tar.gz pi@$1:/home/pi

if [ "$3" = "update" ]; then
  echo "let machine to do fw update"
  scp update.sh pi@$1:/home/pi
  ssh pi@$1 <update.sh
fi
