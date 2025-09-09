const mongoose = require('mongoose')
const { logger } = require('./Logger')

/**
 * Database class manages connections to the MongoDB database.
 * 
 * @class
 * @property {string} uri The MongoDB connection string.
 * @property {object} connection A mongoose.js connection object.
 */
class Database {
  constructor({ user, password, db_name }) {
    // TODO: Error handling on bad inputs to constructor.
    this._uri = `mongodb+srv://${user}:${password}.shzb2.mongodb.net/${db_name}?retryWrites=true&w=majority`
    this._connection = null
  }

  get uri() { return this._uri }
  get name() { return this.uri.split('/').pop().split('?')[0] }
  get connection() { return this._connection }

  /**
   * Establish a connection to the database and initialize connection event handlers
   */
  async connect() {
    try {
      logger.info(`Connecting to database: ${this.name} ...`)
      await mongoose.connect(this.uri, {})
      const connection = mongoose.connection

      connection.once('connected', () => {
        logger.info(`Established connection database: ${this.name}`)
      })
      connection.once('disconnected', () => {
        logger.info(`Closed connection to database: ${this.name}`)
      })
      connection.once('error', err => {
        logger.info(`Database connection error for ${this.name} database: error ${err}`)
      })
      this._connection = connection
    } catch (error) {
      logger.error(error)
      throw error
    }
  }

  /**
   * Close connections to the database
   */
  async disconnect() {
    try {
      logger.info(`Disconnecting from database: ${this.name} ...`)
      await this.connection.close()
    } catch (error) {
      logger.error(error)
      throw error
    }
  }
}

module.exports = Database
