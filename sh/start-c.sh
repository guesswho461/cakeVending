#!/bin/sh
unclutter -idle 0 &
matchbox-window-manager -use_cursor no&
chromium-browser --disable-pinch --test-type --no-sandbox --kiosk --disable-translate --noerrdialogs --autoplay-policy=no-user-gesture-required http://localhost
