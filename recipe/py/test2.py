import logging
from datetime import datetime
import sys
import time
import paho.mqtt.client as mqtt
import os


class machineStatus:
    robotMotionDone = True
    ovenFlipTrue = False
    ovenFlipFalse = False
    ovenOpenTrue = False
    ovenOpenFalse = False
    bucketStopTrue = False
    latchArmStopTrue = False
    latchArmStopFalse = False
    latchCvtStopTrue = False
    latchCvtStopFalse = False
    latchSuckStopTrue = False
    latchSuckStopFalse = False
    latchBowlReadyTrue = False
    latchBowlReadyFalse = False
    latchGateOpenTrue = False
    latchGateOpenFalse = False
    latchFanOpenTrue = False
    latchFanOpenFalse = False
    strBowlCnt = "0"
    strArmPos = "0"
    strCvtPos = "0"
    ovenOpMode = "manual"
    bucketOpMode = "manual"
    robotOpMode = "manual"
    allModuleGood2Go = False
    modeRecheckCnt = 0
    isConnected = False


macst = machineStatus()
mqttc = None


def on_connect(mqttc, obj, flags, rc):
    global macst
    if macst.isConnected == False:
        macst.isConnected = True
        logger.warning('broker connected')
    else:
        msg = ("recipe: connect to broker twice")
        logger.fatal(msg)
        # post2backend("/machine/disable")
        mqttc.publish("bucket/status/alarm", msg)
        os._exit(1)


def on_message(mqttc, obj, msg):
    logger.debug(msg.topic + ": " + str(msg.payload))


logger = logging.getLogger('recipe')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
log_filename = str(datetime.now().strftime('recipe_%Y%m%d%H%M%S'))
fh = logging.FileHandler(
    'log/{0}.log'.format(log_filename))
fh.setLevel(logging.INFO)
# create console handler with a higher log level
ch = logging.StreamHandler(sys.stdout)
ch.setLevel(logging.INFO)
# create formatter and add it to the handlers
formatter = logging.Formatter(
    '%(asctime)s %(levelname)s(%(filename)s:%(lineno)d): %(message)s', datefmt='%Y%m%d%H%M%S')
ch.setFormatter(formatter)
fh.setFormatter(formatter)
# add the handlers to logger
logger.addHandler(ch)
logger.addHandler(fh)

logger.warning('recipe start')

mqttc = mqtt.Client(client_id="recipe")
# mqttc.on_publish = on_publish
# mqttc.on_subscribe = on_subscribe
# mqttc.on_log = on_log
mqttc.on_message = on_message
mqttc.on_connect = on_connect
mqttc.connect("localhost", 1883, 30)
mqttc.loop_start()

while macst.isConnected == False:
    time.sleep(1)

# while True:
#     if macst.ovenOpMode == "MQTT" and macst.bucketOpMode == "MQTT" and macst.robotOpMode == "MQTT":
#         macst.allModuleGood2Go = True
#         break
#     else:
#         macst.allModuleGood2Go = False
#         if macst.modeRecheckCnt >= 3:
#             msg = ("recipe: the modules are not all in the remote mode" +
#                    ", modeRecheckCnt: " + str(macst.modeRecheckCnt) +
#                    ", ovenOpMode: " + str(macst.ovenOpMode) +
#                    ", bucketOpMode: " + str(macst.bucketOpMode) +
#                    ", robotOpMode: " + str(macst.robotOpMode))
#             logger.fatal(msg)
#             mqttc.publish("bucket/status/alarm", msg)
#             os._exit(1)
#         else:
#             macst.modeRecheckCnt = macst.modeRecheckCnt + 1
#             time.sleep(1)

logger.warning("recipe done")
