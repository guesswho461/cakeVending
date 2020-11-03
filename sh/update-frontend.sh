#!/bin/sh

sudo systemctl stop nginx.service cakeFrontendBrowser.service
tar zxvf fw.tar.gz
#rm -rf fw.tar.gz
sudo systemctl daemon-reload
sudo systemctl restart nginx.service cakeFrontendBrowser.service rc.local.service
