const { CredentialsMethod, OpenFgaClient } = require('@openfga/sdk')

// SDK Documentation
// https://github.com/openfga/js-sdk

class FGA {
  constructor () {
    const options = {
      apiUrl: process.env.OKTA_FGA_BASE_URL,
      storeId: process.env.OKTA_FGA_STORE_ID,
      authorizationModelId: process.env.FGA_MODEL_ID, // Optional, can be overridden per request
      credentials: {
        method: CredentialsMethod.ClientCredentials,
        config: {
          apiTokenIssuer: process.env.OKTA_FGA_API_TOKEN_ISSUER,
          apiAudience: `${process.env.OKTA_FGA_BASE_URL}/`,
          clientId: process.env.OKTA_FGA_CLIENT_ID,
          clientSecret: process.env.OKTA_FGA_CLIENT_SECRET,
        }
      }
    }
    const client = new OpenFgaClient(options)
    this._client = client
  }

  get client() {
    return this._client
  }

  /**
   * 
   * @param {string} relation 
   * @returns Express.js middleware function
   */
  async check ({ user, relation, object }) {
    const { allowed } = await this.client.check({ user, relation, object })
    return allowed
  }

  /**
   * Lists all objects of type "type" which the user has the relationship "relation" to.
   * Appends the result set to the "objects" property of the request object
   * 
   * @param {string} relation the relationship to check for
   * @param {string} type the object type
   * @returns Express.js middleware function
   */
  async listObjects({ user, relation, type }) {
    const { objects } = await this.client.listObjects({ user, relation, type })
    const ids = objects && Array.isArray(objects) ? objects.map(x => parseInt(x.split(':')[1])) : [];
    return ids
  }

  async listRelations ({ user, object, relations }) {
    const response = await this.client.listRelations({ user, object, relations })
    return response.relations
  }

  async write ({ writes=[], deletes=[] }) {
    await this.client.write({ writes, deletes }, {});
  }

  async writeTuples (tuples) {
    await this.client.writeTuples(tuples);
  }

  async deleteTuples (tuples) {
    await this.client.deleteTuples(tuples);
  }
}

const fga = new FGA()

module.exports = fga