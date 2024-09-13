const Queue = require('bull');
const redisApp = require('../utils/redisApp');
const taskController = require('../controller/taskController');

const requestQueue = new Queue('requestQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

const RATE_LIMIT = 20;
const TIME_WINDOW = 60 * 1000;

// process the queue
requestQueue.process(async (job, done) => {
  const { user_id, originalUrl } = job.data;
  const redisClient = await redisApp();

  try {
    const currentTime = Date.now();
    const windowStart = currentTime - TIME_WINDOW;

    // removing req made at past time_window
    const deleteOldip = await redisClient.zRemRangeByScore(
      user_id,
      0,
      windowStart
    );

    const requestCount = await redisClient.zCard(user_id);

    //check for rate-limit
    if (requestCount < RATE_LIMIT) {
      // console.log(
      //   `Process Queue ${user_id}-task completed at-${new Date().toString()}`
      // );

      // add to redis after successfull process
      await redisClient.zAdd(user_id, {
        score: currentTime,
        value: currentTime.toString(),
      });

      await taskController.task(user_id);
      setTimeout(() => {
        done();
      }, 1000);
    } else {
      // requeue if passed rate limit again

      // console.log(
      //   `Requeuing request for user: ${user_id} - ${new Date().toString()}`
      // );
      await requestQueue.add(job.data, {
        delay: TIME_WINDOW - RATE_LIMIT * 1000,
      });
      done();
    }
  } catch (error) {
    console.error('Error processing job:', error);
    done(error);
  }
});

module.exports = requestQueue;
