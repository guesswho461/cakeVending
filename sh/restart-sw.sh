#!/bin/sh

sudo systemctl restart nginx.service cakeBackend.service cakeBackendGPIO.service cakeFrontendBrowser.service
sudo systemctl daemon-reload
sudo systemctl restart rc.local.service