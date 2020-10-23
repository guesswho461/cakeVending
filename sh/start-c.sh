#!/bin/sh
DISPLAY=:0 xset -dpms&
DISPLAY=:0 xset s off&
DISPLAY=:0 xinput --set-prop 'ILITEK Multi-Touch-V3000' 'Coordinate Transformation Matrix' -1 0 1 0 -1 1 0 0 1&
unclutter -idle 0&
matchbox-window-manager -use_cursor no&
chromium-browser --check-for-update-interval=31536000 --disable-features=TranslateUI --disable-pinch --test-type --no-sandbox --kiosk --disable-translate --noerrdialogs --autoplay-policy=no-user-gesture-required http://localhost