
import time
import logging
from datetime import datetime
import os
from argparse import ArgumentParser

logLevel = logging.INFO

parser = ArgumentParser()
parser.add_argument("--vol", help="optional argument",
                    dest="vol", default="30", type=float)
parser.add_argument("--cnt", help="optional argument",
                    dest="cnt", default="6", type=float)

args = parser.parse_args()


logger = logging.getLogger('recipe')
logger.setLevel(logLevel)
# create file handler which logs even debug messages
log_filename = str(datetime.now().strftime('recipe_%Y%m%d%H%M%S'))
fh = logging.FileHandler(
    'log/{0}.log'.format(log_filename))
fh.setLevel(logLevel)
# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logLevel)
# create formatter and add it to the handlers
formatter = logging.Formatter(
    '%(asctime)s %(levelname)s(%(filename)s:%(lineno)d): %(message)s', datefmt='%Y%m%d%H%M%S')
ch.setFormatter(formatter)
fh.setFormatter(formatter)
# add the handlers to logger
logger.addHandler(ch)
logger.addHandler(fh)

logger.info('recipe start')

logger.info("--vol " + str(args.vol))
logger.info("--cnt " + str(args.cnt))

logger.info("recipe done")
