#!/bin/sh
matchbox-window-manager -use_cursor no&
chromium-browser --disable-pinch --test-type --no-sandbox --kiosk --disable-translate --noerrdialogs http://localhost
