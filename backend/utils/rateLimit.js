const rateLimit = require('express-rate-limit');

 
const RateLimiter = rateLimit({
    windowMs:  60 * 1000, //  1 minutes
    max: 2,                // Limit each IP to 2 requests per 1 minutes
    message: {message: 'Too many login attempts. Try again after 1 minute.'},
});

module.exports = {RateLimiter}