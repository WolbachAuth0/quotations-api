const { createClient } = require('redis')
const { logger } = require('./Logger')

/**
 * The Cache class manages the connection to the REDIS database. This class
 * is optimized for deploying the application to Heroku and using a REDIS
 * Enterprise Cloud.
 * 
 * See documentation
 * 
 * https://developer.redis.com/create/heroku/herokunodejs/
 * https://github.com/redis/node-redis
 */
class Cache {
  constructor () {
    const client = createClient({
      password: process.env.REDIS_PASSWORD,
      socket: {
          host: process.env.REDIS_URL,
          port: process.env.REDIS_PORT
      }
    })
    this.client = client
  }

  get redis () {
    return this.client
  }

  async connect () {
    this.redis.on('error', function (err) {
      logger.info(`Redis Client Error: ${err.message}`)
      console.error(err)
    })

    return await this.redis.connect()
  }

  /**
   * Gracefully disconnect from REDIS database.
   * 
   * @returns 
   */
  async disconnect () {
    return await this.redis
      .disconnect()
      .then(disconnected => {
        logger.info('Successfully disconnected from Redis Client.')
      })
  }

  /**
   * Fetch data from the cache by key.
   * 
   * @param {object} parameters
   * @param {string} parameters.key 
   */
  async getDataByKey ({ key }) {
    return await this.redis.get(key)
  }

  /**
   * Set data into the cache with a time to live.
   * 
   * @param {object} parameters
   * @param {string} parameters.key The cache key
   * @param {integer} parameters.ttl The time to live in seconds
   * @param {*} parameters.data The data to set
   */
  async setDataByKey ({ key, ttl, data }) {
    const response = await this.redis.set(key, JSON.stringify(data), { EX: ttl, NX: true })
    logger.info(response)
    return response
  }

  /**
   * Deletes the keys from memory
   * 
   * @param {object} parameters
   * @param {String[]} parameters.keys The array of keys to be deleted.
   */
  async deleteKeys ({ keys }) {
    return await this.redis.del(keys)
  }

  async clearAllData () {
    const keys = await cache.redis.keys('*')
    logger.info('keys found: ', keys)
    if (keys.length > 0) {
      const response = await cache.deleteKeys({ keys })
      logger.info(`deleted ${response} keys`)
    }
  }
}

const cache = new Cache()
module.exports = cache
