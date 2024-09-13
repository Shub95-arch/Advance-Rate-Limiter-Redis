const winston = require('winston');
const catchAsync = require('../utils/catchAsync');

const logger = winston.createLogger({
  format: winston.format.printf(({ message }) => message),
  transports: [
    // TO STORE LOGS
    new winston.transports.File({ filename: 'task-log.txt' }),
  ],
});

exports.task = catchAsync(async (user_id) => {
  console.log(`${user_id}-task completed at-${Date.now()}`);
  logger.info(`${user_id}-task completed at-${Date.now()}`);
});
