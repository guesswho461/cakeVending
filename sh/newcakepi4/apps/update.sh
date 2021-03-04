#!/bin/sh

sudo systemctl stop nginx.service cakeBackend.service cakeBackendGPIO.service cakeFrontendBrowser.service
tar zxvf fw.tar.gz
#rm -rf fw.tar.gz
sudo systemctl restart nginx.service cakeBackend.service cakeBackendGPIO.service cakeFrontendBrowser.service
sudo systemctl daemon-reload
sudo systemctl restart rc.local.service
