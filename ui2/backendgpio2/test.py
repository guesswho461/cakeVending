#!/usr/bin/python

import time
import cake.GPIO64 as cake

gpio64 = cake.GPIO64()

try:
    gpio64.init()
    gpio64.clear()
    print("start to blink on all pins (CTRL+C to quit)")
    while (True):
        for bank in gpio64.BANK:
            gpio64.setSPI(bank, gpio64.GPIO[0], 0xFF)
            time.sleep(0.2)
            gpio64.setSPI(bank, gpio64.GPIO[0], 0x00)
            time.sleep(0.2)

finally:
    gpio64.clear()
