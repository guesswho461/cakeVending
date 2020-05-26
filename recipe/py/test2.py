import logging
from datetime import datetime
import sys


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
logger.warning("recipe done")
