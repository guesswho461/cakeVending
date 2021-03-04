#!/bin/sh

LAST_DIR=$(pwd)

# install the apps, frontend, backend, backend gpio, serial logger, daily new turnover
tar zxvf ./apps/fw.tar.gz -C /home/pi

# frontend
cp ./apps/.env /home/pi/ui2/frontend

# backend
cd /home/pi/ui2/backend
npm install

# backend gpio
sudo apt -y install pigpio
cd /home/pi/ui2/backendgpio
npm install

# recipe
cd $LAST_DIR
mkdir -p /home/pi/recipe
cp ./apps/dummy.py /home/pi/recipe
cd /home/pi/recipe
sudo apt -y install python-pip
sudo pip install paho-mqtt python-dotenv requests psutil

# bucket serial
cd $LAST_DIR
mkdir -p /home/pi/ui2/bucket
cp ./apps/bucketserial.py /home/pi/ui2/bucket

# auto recognize the hardware
sudo cp ./apps/*.rules /etc/udev/rules.d/
sudo udevadm control --reload

# config the systemd
sudo apt -y install xinput
cp ./apps/*.sh /home/pi
sudo cp ./apps/*.service /usr/lib/systemd/system/
sudo cp ./apps/*.timer /usr/lib/systemd/system/
sudo systemctl enable cakeBackend.service cakeBackendGPIO.service cakeFrontendBrowser.service cakeBucketSerial.service cakeDailyDisable.timer cakeDailyNewTurnover.timer

# install chinese font
cp ./apps/Noto_sans_TC/*.otf /usr/local/share/fonts/
fc-cache -f -v

echo "install app done"
