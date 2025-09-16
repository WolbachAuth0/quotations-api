const http = require('axios')
const { respond } = require('../middleware/responseFormatter')

module.exports = {
  token
}

function handleError (req, res, error) {
  if (error?.status == 400) {
    const message = error.message;
    const data = error?.stack || {}
    respond(req, res).badRequest({ message, data })
  } else if (error?.status == 403) {
    const message = error?.response?.data.error || error.message;
    const data = {
      description: error?.response?.data?.error_description || error.message
    }
    respond(req, res).forbidden({ message, data })
  } else {
    respond(req, res).serverError(error)
  }
}

/**
 * The /oauth/token endpoint is used to fetch an access token with client credentials.
 * 
 * @param {*} req Express.js request object
 * @param {*} res Express.js response object
 */
async function token (req, res) {
  try {
    const response = await getM2MToken(req.body)
    const message = 'Fetched access token from authorization server.'
    const data = response.data
    respond(req, res).ok({ message, data })
  } catch (error) {
    handleError(req, res, error)
  }
}

async function getM2MToken ({ client_id, client_secret }) {
  const request = {
    method: 'post',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    data: new URLSearchParams({
      client_id,
      client_secret,
      audience: process.env.AUDIENCE,
      grant_type: 'client_credentials'
    })
  }
  const response = await http(request)
  return response
}