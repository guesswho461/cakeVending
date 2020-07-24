#!/bin/sh
unclutter -idle 0 &
matchbox-window-manager -use_cursor no&
chromium-browser --disable-pinch --test-type --no-sandbox --kiosk --disable-translate --noerrdialogs --autoplay-policy=no-user-gesture-required http://localhost


chromium-browser 
--check-for-update-interval=31536000 
--disable-features=TranslateUI 
--disable-pinch 
--incognito 
--noerrdialogs 
--disable-suggestions-service 
--disable-translate 
--disable-save-password-bubble 
--disable-session-crashed-bubble 
--disable-infobars 
--disable-gesture-typing 
--kiosk 
--app=http://127.0.0.1:3344/modules/front2/app/app.html 