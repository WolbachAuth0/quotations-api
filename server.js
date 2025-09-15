const express = require('express')
const serveStatic = require('serve-static')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')

// Import ErrorHandler
const { globalErrorHandler } = require('./middleware/responseFormatter')
const enforceHTTPS = require('./middleware/enforceHTTPS')
const { routerLogger, errorLogger } = require('./models/Logger')

const app = express()

// middleware ...
app.use(express.json())
app.use(routerLogger)
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))

 // Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views'); 


// enforce https in production
if(process.env.NODE_ENV === 'production') {
  app.use(enforceHTTPS)
}

// Serve static files from the public directory
app.use('/assets', serveStatic(path.join(__dirname, './public')));

// Routes
app.use('/', require('./routes/home'));
app.use('/api/quotations', require('./routes/quotations'));

// override express error handler
app.use(globalErrorHandler) 
// express-winston errorLogger AFTER the other routes have been defined.
app.use(errorLogger)

module.exports = app
