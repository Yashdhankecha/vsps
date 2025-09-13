const { RateLimiterMemory } = require('rate-limiter-flexible');

const passwordResetRateLimiter = new RateLimiterMemory({
  points: 5, 
  duration: 60 * 60, 
});

const contactRateLimiter = new RateLimiterMemory({
  points: 10, 
  duration: 60 * 60, 
});


const passwordResetMiddleware = (req, res, next) => {
  passwordResetRateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ message: 'Too many password reset requests. Try again later.' });
    });
};


const contactRateLimiterMiddleware = (req, res, next) => {
  contactRateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      res.status(429).json({ message: 'Too many contact requests. Try again later.' });
    });
};

module.exports = { 
  contactRateLimiter: contactRateLimiterMiddleware,  
  passwordResetRateLimiter: passwordResetMiddleware 
};
