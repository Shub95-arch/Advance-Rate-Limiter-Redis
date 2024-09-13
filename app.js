const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const app = express();
const taskRouter = require('./routes/taskRoute');

const AppError = require('./utils/appError'); // error handlers
const globalErrorHandler = require('./controller/errorController');

app.use(morgan('dev')); //morgan middleware
app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  //PREVENTS FROM DDOS
  max: 100, // No. of requests
  windowMs: 60 * 60 * 1000, // Time in Ms
  message: 'Too many requests from this IP, Please try again in an hour', // Error message
});

// app.use('/api', limiter);

app.use('/api/v1/task', taskRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Cant Find ${req.originalUrl} on this server`, 404)); //ERROR HANDLERS
});

app.use(globalErrorHandler);

module.exports = app;
