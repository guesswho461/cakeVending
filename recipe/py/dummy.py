# change from testRun0701

import paho.mqtt.client as mqtt
import signal
import time
import threading
import logging
from datetime import datetime


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


macst = machineStatus()
looping = False
mqttc = None
latchTakeBowl_Start = False

# def on_publish(mqttc, obj, mid):
#     logger.debug("mid: " + str(mid))
#     pass


# def on_subscribe(mqttc, obj, mid, granted_qos):
#     logger.debug("Subscribed: " + str(mid) + " " + str(granted_qos))


# def on_log(mqttc, obj, level, string):
#     logger.debug(string)

def stop_all(*args):
    global looping
    looping = False


def on_connect(mqttc, obj, flags, rc):
    logger.warning('broker connected')
    mqttc.subscribe('robot/status/stop')
    mqttc.subscribe('oven/status/flip')
    mqttc.subscribe('oven/status/open')
    mqttc.subscribe('bucket/status/stop')
    mqttc.subscribe('latch/status/arm/stop')
    mqttc.subscribe('latch/status/cvt/stop')
    mqttc.subscribe('latch/status/bowl/cnt')
    mqttc.subscribe('latch/status/bowl/ready')
    mqttc.subscribe('latch/status/arm/suck')
    mqttc.subscribe('latch/status/arm/release')
    mqttc.subscribe('latch/status/gate/open')
    mqttc.subscribe('latch/status/fan/open')
    mqttc.subscribe('latch/status/vibration')
    mqttc.subscribe('latch/status/arm/pos')
    mqttc.subscribe('latch/status/cvt/pos')
    mqttc.subscribe('oven/status/mode')


def on_message(mqttc, obj, msg):
    global macst
    logger.debug(msg.topic + ": " + str(msg.payload))
    if msg.topic == "robot/status/stop":
        if str(msg.payload) == "true":
            macst.robotMotionDone = True
        else:
            macst.robotMotionDone = False
    elif msg.topic == "oven/status/flip":
        if str(msg.payload) == "true":
            macst.ovenFlipTrue = True
            macst.ovenFlipFalse = False
        else:
            macst.ovenFlipTrue = False
            macst.ovenFlipFalse = True
    elif msg.topic == "oven/status/open":
        if str(msg.payload) == "true":
            macst.ovenOpenTrue = True
            macst.ovenOpenFalse = False
        else:
            macst.ovenOpenTrue = False
            macst.ovenOpenFalse = True
    elif msg.topic == "bucket/status/stop":
        if str(msg.payload) == "true":
            macst.bucketStopTrue = True
            macst.bucketStopFalse = False
        else:
            macst.bucketStopTrue = False
            macst.bucketStopFalse = True
    elif msg.topic == "latch/status/arm/stop":
        if str(msg.payload) == "true":
            macst.latchArmStopTrue = True
            macst.latchArmStopFalse = False
        else:
            macst.latchArmStopTrue = False
            macst.latchArmStopFalse = True
    elif msg.topic == "latch/status/cvt/stop":
        if str(msg.payload) == "true":
            macst.latchCvtStopTrue = True
            macst.latchCvtStopFalse = False
        else:
            macst.latchCvtStopTrue = False
            macst.latchCvtStopFalse = True
    elif msg.topic == "latch/status/arm/suck":
        if str(msg.payload) == "true":
            macst.latchSuckStopTrue = True
            macst.latchSuckStopFalse = False
        else:
            macst.latchSuckStopTrue = False
            macst.latchSuckStopFalse = True
    elif msg.topic == "latch/status/bowl/cnt":
        macst.strBowlCnt = str(msg.payload)
    elif msg.topic == "latch/status/bowl/ready":
        if str(msg.payload) == "true":
            macst.latchBowlReadyTrue = True
            macst.latchBowlReadyFalse = False
            # logger.trace('Ready:True');
        else:
            macst.latchBowlReadyTrue = False
            macst.latchBowlReadyFalse = True
            # logger.trace('Ready:False'); }
    elif msg.topic == "latch/status/gate/open":
        if str(msg.payload) == "true":
            macst.latchGateOpenTrue = True
            macst.latchGateOpenFalse = False
            # logger.trace('gateCmd:True');
        else:
            macst.latchGateOpenTrue = False
            macst.latchGateOpenFalse = True
            # logger.trace('gateCmd:False');}
    elif msg.topic == "latch/status/fan/open":
        if str(msg.payload) == "true":
            macst.latchFanOpenTrue = True
            macst.latchFanOpenFalse = False
            # logger.trace('fanCmd:True');
        else:
            macst.latchFanOpenTrue = False
            macst.latchFanOpenFalse = True
            # logger.trace('fanCmd:False');}
    elif msg.topic == "latch/status/vibration":
        if str(msg.payload) == "true":
            macst.latchVibrationTrue = True
            macst.latchVibrationFalse = False
            # logger.trace('vCmd:True');
        else:
            macst.latchVibrationTrue = False
            macst.latchVibrationFalse = True
            # logger.trace('vCmd:False');}
    elif msg.topic == "latch/status/arm/pos":
        macst.strArmPos = str(msg.payload)
        # logger.trace(strArmPos);
    elif msg.topic == "latch/status/cvt/pos":
        macst.strCvtPos = str(msg.payload)
        # logger.trace(strCvtPos);
    elif msg.topic == "latch/status/arm/release":
        if str(msg.payload) == "true":
            macst.latchArmReleaseTrue = True
            macst.latchArmReleaseFalse = False
        else:
            macst.latchArmReleaseTrue = False
            macst.latchArmReleaseFalse = True
    elif msg.topic == "oven/status/mode":
        macst.ovenOpMode = str(msg.payload)


def move_robot(target, pos, isPass="WAIT"):
    global mqttc, macst
    macst.robotMotionDone = False
    mqttc.publish("robot/cmd/jog/" + target, pos)
    if isPass != "PASS":
        while macst.robotMotionDone == False:
            logger.debug("robotMotionDone: " + str(macst.robotMotionDone))
            time.sleep(0.1)


def spit_cake(vol):
    global mqttc, macst
    macst.bucketStopTrue = False
    mqttc.publish("bucket/cmd/jog/vol", vol)
    while macst.bucketStopTrue == False:
        logger.debug("bucketStopTrue: " + str(macst.bucketStopTrue))
        time.sleep(0.1)


def spit_stop():
    global macst
    macst.bucketStopTrue = False
    while macst.bucketStopTrue == False:
        logger.debug("bucketStopTrue: " + str(macst.bucketStopTrue))
        time.sleep(0.1)


def close_oven():
    global mqttc, macst
    macst.ovenOpenFalse = False
    mqttc.publish("oven/cmd/open", "false")
    while macst.ovenOpenFalse == False:
        logger.debug("ovenOpenFalse: " + str(macst.ovenOpenFalse))
        time.sleep(0.1)


def move_robot_and_spit(pnt_name, pos, vol):
    move_robot("y", pos)
    logger.info("robot move to " + pnt_name)
    spit_cake(vol)
    logger.info("spit to " + pnt_name)


def flip_oven(cmd):
    global mqttc, macst
    if cmd == True:
        macst.ovenFlipTrue = False
        mqttc.publish("oven/cmd/flip", "true")
        while macst.ovenFlipTrue == False:
            logger.debug("ovenFlipTrue: " + str(macst.ovenFlipTrue))
            time.sleep(0.1)
    else:
        macst.ovenFlipFalse = False
        mqttc.publish("oven/cmd/flip", "false")
        while macst.ovenFlipFalse == False:
            logger.debug("ovenFlipFalse: " + str(macst.ovenFlipFalse))
            time.sleep(0.1)


def robot_go_home():
    global mqttc, macst
    macst.robotMotionDone = False
    mqttc.publish("robot/cmd/home/z", "true")
    mqttc.publish("robot/cmd/home/y", "true")
    mqttc.publish("robot/cmd/home/x", "true")
    while macst.robotMotionDone == False:
        logger.debug("robotMotionDone: " + str(macst.robotMotionDone))
        time.sleep(0.1)


def pick_cake_and_drop(pnt_name, pos_y):
    global mqttc, macst
    move_robot("x", "200", "PASS")
    move_robot("y", pos_y, "PASS")
    mqttc.publish("robot/cmd/jog/fork", "50")  # gripper OPEN
    move_robot("z", "-104")
    logger.info("robot to upper " + pnt_name)
    mqttc.publish("robot/cmd/jog/fork", "0")  # gripper CLOSE
    logger.info("robot grip at " + pnt_name)
    move_robot("z", "-70")
    logger.info("robot move up to " + pnt_name)
    move_robot("x", "160")
    move_robot("x", "3", "PASS")
    move_robot("y", "-130", "PASS")
    move_robot("z", "-70")
    mqttc.publish("robot/cmd/jog/fork", "60")  # gripper OPEN
    logger.info("robot drop cake")


def openFan():
    # open latch fan
    macst.latchFanOpenTrue = False
    mqttc.publish("latch/cmd/fan/open", "true")
    logger.info("10")
    while macst.latchFanOpenTrue == False:
        logger.debug("latchFanOpenTrue: " + str(macst.latchFanOpenTrue))
        time.sleep(0.1)


def unloading():
    global mqttc, macst
    macst.latchBowlReadyTrue = False
    while macst.latchBowlReadyTrue == False:
        logger.debug("latchBowlReadyTrue: " + str(macst.latchBowlReadyTrue))
        time.sleep(0.1)

    # open latch gate
    mqttc.publish("latch/cmd/light/open", "true")  # open LED

    macst.latchGateOpenTrue = False
    mqttc.publish("latch/cmd/gate/open", "true")
    logger.info("11")
    while macst.latchGateOpenTrue == False:
        logger.debug("latchGateOpenTrue: " + str(macst.latchGateOpenTrue))
        time.sleep(0.1)
    time.sleep(1)
    logger.info("12")

    # close latch gate
    macst.latchGateOpenFalse = False
    mqttc.publish("latch/cmd/gate/open", "false")
    while macst.latchGateOpenFalse == False:
        logger.debug("latchGateOpenFalse: " + str(macst.latchGateOpenFalse))
        time.sleep(0.1)
    time.sleep(1)
    logger.info("13")

    # close latch fan
    macst.latchFanOpenFalse = False
    mqttc.publish("latch/cmd/fan/open", "false")
    while macst.latchFanOpenFalse == False:
        logger.debug("latchFanOpenFalse: " + str(macst.latchFanOpenFalse))
        time.sleep(0.1)
    time.sleep(0.5)
    logger.info("14")

    # mqttc.publish("latch/cmd/light/open", "false") #close LED  #change to firmware

    logger.warning("strBowlCnt: " + macst.strBowlCnt)
    logger.info("Stock Bowl Process finish!")


def latchGateOpenNClose():
    global mqttc, macst
    macst.latchBowlReadyTrue = False
    while macst.latchBowlReadyTrue == False:
        logger.debug("latchBowlReadyTrue: " + str(macst.latchBowlReadyTrue))
        time.sleep(0.1)

    time.sleep(1)

    macst.latchGateOpenTrue = False
    mqttc.publish("latch/cmd/gate/open", "true")
    logger.info("11")
    while macst.latchGateOpenTrue == False:
        logger.debug("latchGateOpenTrue: " + str(macst.latchGateOpenTrue))
        time.sleep(0.1)
    time.sleep(1)

    # close latch gate
    macst.latchGateOpenFalse = False
    mqttc.publish("latch/cmd/gate/open", "false")
    while macst.latchGateOpenFalse == False:
        logger.debug("latchGateOpenFalse: " + str(macst.latchGateOpenFalse))
        time.sleep(0.1)


def ctrl_oven_and_robot():
    global mqttc, latchTakeBowl_Start
    logger.warning('control oven and robot thread start')

    latchTakeBowl_Start = True
    logger.info("main script start!")

    mqttc.publish("robot/cmd/jog/vel", "300")
    mqttc.publish("bucket/cmd/jog/vel", "270")

    mqttc.publish("oven/cmd/open", "true")
    logger.info("oven first open")
    time.sleep(1)  # sec

    #mqttc.publish("bucket/cmd/jog/vol", 99)
    logger.info("Suck until to the top")

    move_robot("x", "240", "PASS")
    move_robot("z", "-105", "PASS")
    move_robot("y", "-15")
    move_robot("y", "-197")

    # spit_stop()
    spit_cake(99)

    vol = 28

    move_robot_and_spit("P6", "-243", vol)
    move_robot_and_spit("P5", "-197", vol)
    move_robot_and_spit("P4", "-151", vol)
    move_robot_and_spit("P3", "-105", vol)
    move_robot_and_spit("P2", "-60", vol)
    move_robot_and_spit("P1", "-14", vol)

    spit_cake("-10")
    logger.info("pump suck back")

    move_robot("x", "0", "PASS")
    move_robot("y", "0", "PASS")
    move_robot("z", "0", "PASS")
    logger.info("robot move to P0")

    T_all = 210  # Bake total time(sec)
    T1 = T_all*0.2
    T2 = T_all*0.8

    close_oven()
    logger.info("close oven")

    flip_oven(True)
    logger.info("oven flip true")

    mqttc.publish("bucket/cmd/jog/vol", -50)  # suck all back

    flip_oven(False)
    logger.info("oven flip true")

    flip_oven(True)
    logger.info("oven flip true")

    time.sleep(T1)  # bake T1

    flip_oven(False)
    logger.info("oven flip false")

    time.sleep(T2)  # bake T2

    robot_go_home()
    logger.info("robot go home")

    mqttc.publish("oven/cmd/open", "true")
    logger.info("oven open")
    time.sleep(1)

    openFan()

    thread11 = threading.Thread(target=latchGateOpenNClose)
    thread22 = threading.Thread(target=latchGateOpenNClose)

    pick_cake_and_drop("P1", "-19")
    pick_cake_and_drop("P2", "-65")
    thread11.start()
    pick_cake_and_drop("P3", "-110")
    pick_cake_and_drop("P4", "-156")
    thread22.start()
    pick_cake_and_drop("P5", "-202")
    pick_cake_and_drop("P6", "-248")

    move_robot("x", "0", "PASS")
    move_robot("y", "0", "PASS")
    move_robot("z", "0", "PASS")
    logger.info("robot move to P0")

    close_oven()
    logger.info("close oven")

    unloading()
    logger.info("drop cake to bowl")

    robot_go_home()
    logger.info("robot go home")

    logger.info("Process finish!!!!!!!!!!!!!")
    logger.warning('control oven and robot thread end')


def move_cvt(pos, delay):
    global mqttc, macst
    macst.latchCvtStopTrue = False
    mqttc.publish("latch/cmd/cvt/pos", pos)
    time.sleep(delay)
    while macst.latchCvtStopTrue == False:
        logger.debug("latchCvtStopTrue: " + str(macst.latchCvtStopTrue))
        time.sleep(0.1)


def move_arm(pos, delay):
    global mqttc, macst
    macst.latchArmStopTrue = False
    mqttc.publish("latch/cmd/arm/pos", pos)
    time.sleep(delay)
    while macst.latchArmStopTrue == False:
        logger.debug("latchArmStopTrue: " + str(macst.latchArmStopTrue))
        time.sleep(0.1)


def arm_suck(cmd, delay):
    global mqttc, macst
    if cmd == True:
        macst.latchSuckStopTrue = False
        mqttc.publish("latch/cmd/arm/suck", "true")
        time.sleep(delay)
        while macst.latchSuckStopTrue == False:
            logger.debug("latchSuckStopTrue: " + str(macst.latchSuckStopTrue))
            time.sleep(0.1)
    else:
        macst.latchSuckStopFalse = False
        mqttc.publish("latch/cmd/arm/suck", "false")
        time.sleep(delay)
        while macst.latchSuckStopFalse == False:
            logger.debug("latchSuckStopFalse: " +
                         str(macst.latchSuckStopFalse))
            time.sleep(0.1)


def ctrl_latch():
    global macst, latchTakeBowl_Start
    waitTime = 0.1
    global mqttc
    logger.warning('control latch thread start')
    logger.info('sub script start!')

    # set arm speed
    mqttc.publish("latch/cmd/arm/vel", "40")
    time.sleep(waitTime)

    # set cvt speed
    mqttc.publish("latch/cmd/cvt/vel", "130")
    time.sleep(waitTime)

    latchTakeBowl_Start = True

    while latchTakeBowl_Start == False:
        logger.debug("latchTakeBowl_Start: " + str(latchTakeBowl_Start))
        time.sleep(0.1)

    retry_take_bowl = 0

    while True:
        # move cvt to bowl
        logger.info('01')
        move_cvt("-202", 2)

        # move arm up to bowl
        logger.info('02')
        # offset the arm
        offset = retry_take_bowl % 3
        if offset == 0:
            move_arm("110", 3)
        elif offset == 1:
            move_arm("112", 3)
        elif offset == 2:
            move_arm("115", 3)

        # suck the bowl
        logger.info('03')
        arm_suck(True, 0.3)

        # move arm down
        logger.info('04')
        move_arm("22", 2)

        # release the bowl
        logger.info('05')
        arm_suck(False, 4)

        # move arm to home
        logger.info('06')
        move_arm("0", 1.5)

        # move cvt to catch the cake
        logger.info('07')
        move_cvt("0", 2)

        #
        logger.info('08')
        time.sleep(0.5)
        retry_take_bowl = retry_take_bowl + 1

        # confirm the cake was catched
        if macst.latchBowlReadyTrue == False and retry_take_bowl < 10:
            continue
        else:
            break

    # suck bowl multiple fail
    if retry_take_bowl >= 10:
        logger.fatal("take bowl error!")

    latchTakeBowl_Start = False

    # unloading() #just for test

    logger.warning('control latch thread end')


logger = logging.getLogger('recipe')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
log_filename = str(datetime.now().strftime('recipe_%Y%m%d%H%M%S'))
fh = logging.FileHandler(
    'log/{0}.log'.format(log_filename))
fh.setLevel(logging.INFO)
# create console handler with a higher log level
ch = logging.StreamHandler()
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
mqttc.connect("localhost", 1883, 60)
mqttc.loop_start()

while True:
    if macst.ovenOpMode == "remote" and macst.bucketOpMode == "remote" and macst.robotOpMode == "remote":
        macst.allModuleGood2Go = True
        break
    else:
        macst.allModuleGood2Go = False
        if macst.modeRecheckCnt >= 3:
            break
        else:
            macst.modeRecheckCnt = macst.modeRecheckCnt + 1
            time.sleep(1)

if macst.allModuleGood2Go == True:
    thread1 = threading.Thread(target=ctrl_oven_and_robot)
    thread2 = threading.Thread(target=ctrl_latch)

    thread1.start()
    thread2.start()

    thread1.join()
    thread2.join()

    mqttc.publish("gate/cmd/open", "true")
else:
    msg = ("recipe: the modules are not all in the remote mode" +
           ", modeRecheckCnt: " + str(macst.modeRecheckCnt) +
           ", ovenOpMode: " + str(macst.ovenOpMode) +
           ", bucketOpMode: " + str(macst.bucketOpMode) +
           ", robotOpMode: " + str(macst.robotOpMode))
    logger.fatal(msg)
    mqttc.publish("bucket/status/alarm", msg)

mqttc.disconnect()
mqttc.loop_stop()
logger.warning("recipe done")
