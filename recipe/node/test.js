const log4js = require('log4js');

log4js.configure(
  {
    appenders: {
      file: {
        type: 'dateFile', filename: 'log/recipe.log', daysToKeep: 1, pattern: '.mm'
      },
      out: {
        type: 'stdout'
      }
    },
    categories: {
      default: { appenders: ['file', 'out'], level: 'trace' }
    }
  }
);

const logger = log4js.getLogger('cake');

let cnt = 0;
let cnt1 = 0;

(async () => {
  do {
    logger.trace('123');
    cnt1 = cnt1 + 1;
  } while(cnt1 < 5)
})();

(async () => {
  do {
    logger.trace('456');
    cnt = cnt + 1;
  } while(cnt < 5)
})();

logger.trace('end');
