const path = require('path')

// import the env variables FIRST - Before you do anything else
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, './.env') });
}

const server = require('./server')
const { logger } = require('./models/Logger')
const Database = require('./models/Database.js')

startup(server)

async function startup(server) {
  logger.info(`loaded environment variables from ${process.env.NODE_ENV} settings.`)
  logger.info(`starting server in ${process.env.NODE_ENV} mode.`)

  // connect to database
  const options = {
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PW,
    db_name: process.env.MONGO_DB_NAME
  }
  const database = new Database(options)
  try {
    await database.connect()
    logger.info(`successfully connected to database`)
  } catch (error) {
    logger.warn('An error occurred while connecting to database.')
    logger.error(error)
  }

  // gracefully handle shutdown
  process.once('SIGINT', async () => { await shutdown(database) })
  process.once('SIGTERM', async () => { await shutdown(database) })
  process.once('SIGUSR2', async () => { await shutdown(database) })

  // serve the api on the same port as the front-end in production, but on a different port in development.
  const port = process.env.NODE_ENV === 'development' ? 4000 : process.env.PORT || 8080
  server.listen(port, () => {
    logger.info(`application is listening on port: ${port}`)
  })
}

/**
 * Gracefully stop the server and release resources (e.g. REDIS connection, Datbase connection)
 */
async function shutdown(database) {
  try {
    logger.info(`Initiate graceful shutdown ...`)
    await database.disconnect()
    logger.info('Shutdown complete.')
  } catch (error) {
    logger.info('Graceful shutdown wasn\'t graceful ...')
    console.error(error)
  }
  process.kill(process.pid, 'SIGUSR2')
  process.exit()
}

// export the startup and shutdown methods so that unit tests can import them
module.exports = {
  startup,
  shutdown
}