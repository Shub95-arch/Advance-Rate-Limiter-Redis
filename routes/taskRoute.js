const express = require('express');
const router = express.Router();
const rateLimiter = require('../controller/rateController');

router.post('/', rateLimiter.user_based);

module.exports = router;
