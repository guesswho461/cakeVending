import serial
import logging
import sys

logger = logging.getLogger('bucketserial')
logger.setLevel(logging.DEBUG)
# create file handler which logs even debug messages
log_filename = "bucketserial"
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

logger.info('bucket serial started')

ser = serial.Serial('/dev/ttyUSB4', 9600)
while 1:
    if(ser.in_waiting > 0):
        line = ser.readline()
        logger.info(line)
