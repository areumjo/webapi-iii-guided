const express = require('express'); // importing a CommonJS module
const helmet = require('helmet');
const logger = require('morgan');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();

// GLOBAL MIDDLEWARE

// built-in middleware
server.use(express.json());

// third part middleware
server.use(helmet());
server.use(logger('dev'));

// custom middleware - don't call it like server.use(typeLogger()); ❌
server.use(typeLogger);
server.use(addName);
//server.use(lockout);
//server.use(moodyGatekeeper);


// router
server.use('/api/hubs', hubsRouter);

server.get('/', (req, res) => {
  const nameInsert = (req.name) ? ` ${req.name}` : '';

  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome${nameInsert} to the Lambda Hubs API</p>
    `);
});

// custom middleware
function typeLogger(req, res, next) {
  console.log(`${req.method} Request`);
    // GET Request <-- our console.log fn
  // GET /api/hubs 200 11.845 ms - 470 <-- morgan (logger)
  next();
};

function addName(req, res, next) {
  req.name =req.name || "Cass";
  next();
}

function lockout(req, res, next) {
  res.status(403).json({ message: 'API lockout!' });
}

function moodyGatekeeper(req, res, next) {
  // it keeps you out 1/3 of the time
  // when it decides to keep you out it sends back status 403 msg

  const seconds = new Date().getSeconds();

  if (seconds % 3 === 0) {
    res.status(403).json({ message: "You shall not pass!"});
  } else {
    next();
  }
}

// want this immediate before our export
// global error-handling middleware goes to bottom <== like giant catch
server.use((err, req, res, next) => {
  // only executes if next(err) is called with an argument
  res.status(500).json({
    message: "Bad request",
    err
  })
});

module.exports = server;
