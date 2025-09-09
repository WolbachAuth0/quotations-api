const http = require('axios')
const path = require('path')
const { respond } = require('./../middleware/responseFormatter')

module.exports = {
  home,
  specification,
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

function home (req, res) {
  const package = require('./../package.json');
  const message = 'Welcome to the Quotations API.'
  const data = {
    version: package.version,
    description: package.description,
    lisence: package.license
  }
  respond(req, res).ok({ message, data })

  //res.sendFile(path.join(__dirname, './../views/redoc.html'))
}

function specification (req, res) {
  const message = 'OpenAPI 3.0 specification for the Quotations API.'
  const data = require('./../data/openapi.json')
  respond(req, res).ok({ message, data }) 
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
    url: `https://${process.env.AUTH0_CUSTOM_DOMAIN}/oauth/token`,
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
