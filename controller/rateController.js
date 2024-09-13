const redisApp = require('../utils/redisApp');
const requestQueue = require('../utils/queueProcess');
const taskController = require('./taskController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const TIME_WINDOW = 60 * 1000;
const SECOND_WINDOW = 1000;

const RATE_LIMIT = 20;
const SECOND_LIMIT = 1;

exports.user_based = catchAsync(async (req, res, next) => {
  const redisClient = await redisApp();
  const user_id = req.body.user_id;
  if (!user_id)
    return next(new AppError('No user_id has been passed in the body', 400));
  const currentTime = Date.now();
  const windowStart = currentTime - TIME_WINDOW;
  const secondWindowStart = currentTime - SECOND_WINDOW;

  await redisClient.zRemRangeByScore(user_id, 0, windowStart);

  // count req in window
  const requestCount = await redisClient.zCard(user_id);
  console.log('No. req: ', requestCount + 1);
  const recentRequestCount = await redisClient.zCount(
    user_id,
    secondWindowStart, // to count request made in a second
    currentTime
  );
  const delay = requestCount + 1 > RATE_LIMIT ? TIME_WINDOW : SECOND_WINDOW;
  // console.log(`recentRequestCount: ${recentRequestCount} & delay: ${delay}`);
  if (requestCount < RATE_LIMIT && recentRequestCount < SECOND_LIMIT) {
    // add req timestap to redis
    await redisClient.zAdd(user_id, {
      score: currentTime,
      value: currentTime.toString(),
    });

    await taskController.task(user_id);
    return res.status(200).json({
      status: 'success',
      message: 'request was successfull',
    });
  } else {
    // console.log(`request added to queue ${new Date().toString()}`);
    // add req to queue if within rate limit
    await requestQueue.add(
      {
        user_id,
        originalUrl: req.originalUrl,
      },
      { delay }
    );

    return next(
      new AppError(
        'Too many requests, your request has been queued and will be processed soon.',
        429
      )
    );
    // res.status(429).json({
    //   status: 'queued',
    //   message:
    //     'Too many requests, your request has been queued and will be processed soon.',
    // });
  }
});
