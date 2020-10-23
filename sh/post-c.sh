#!/bin/sh
DISPLAY=:0 xinput --set-prop 'ILITEK Multi-Touch-V3000' 'Coordinate Transformation Matrix' -1 0 1 0 -1 1 0 0 1
DISPLAY=:0 xset s off
DISPLAY=:0 xset -dpms
DISPLAY=:0 xset s noblank
amixer cset numid=1 100%