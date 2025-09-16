
const { respond, httpCodes } = require('../middleware/responseFormatter');

module.exports = {
  health,
  notFoundJSON,
  notFoundView
}

function health (req, res) {
  const package = require('../package.json');
  const message = 'Welcome to the Quotations API.'
  const data = {
    version: package.version,
    description: package.description,
    lisence: package.license
  }
  respond(req, res).ok({ message, data })
}

function notFoundJSON (req, res) {
  const message = 'This endpoint is not implemented.'
  const data = {}
  respond(req, res).notFound({ message, data })
}

function notFoundView (req, res) {
  const statusCode = 404
  const data = {
    statusCode,
    statusText: httpCodes[statusCode],
    error: 'The resource was not found.',
    imageSRC: '/assets/404-NotFound.png'
  }
  res.render('error', data)
}