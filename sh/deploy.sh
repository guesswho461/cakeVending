#!/bin/sh

case $2 in
frontend)
  tar zcvf fw.tar.gz $1/frontend/build
  ;;
backend)
  tar zcvf fw.tar.gz $1/backend/index.js $1/backend/package.json
  ;;
backendgpio)
  tar zcvf fw.tar.gz $1/backendgpio/index.js $1/backendgpio/A4988.js $1/backendgpio/package.json
  ;;
all)
  tar zcvf fw.tar.gz $1/frontend/build $1/backend/index.js $1/backend/package.json $1/backendgpio/index.js $1/backendgpio/A4988.js $1/backendgpio/package.json
  ;;
*)
  echo "unknown command"
  ;;
esac

echo "copy fw to machine"
scp fw.tar.gz pi@$3:/home/pi

if [ "$4" = "update" ]; then
  echo "let machine to do fw update"
  scp update.sh pi@$3:/home/pi
  ssh pi@$3 <update.sh
fi
