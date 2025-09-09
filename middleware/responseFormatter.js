const httpCodes = {
  200: { success: true, text: 'OK' },
  201: { success: true, text: 'CREATED' },
  202: { success: true, text: 'ACCEPTED' },
  204: { success: true, text: 'NO CONTENT' },
  207: { success: true, text: 'MULTI-STATUS' },
  304: { success: false, text: 'NOT MODIFIED' },
  400: { success: false, text: 'BAD REQUEST' },
  401: { success: false, text: 'UNAUTHORIZED' },
  403: { success: false, text: 'FORBIDDEN' },
  404: { success: false, text: 'NOT FOUND' },
  409: { success: false, text: 'CONFLICT' },
  500: { success: false, text: 'INTERNAL SERVER ERROR' },
  501: { success: false, text: 'NOT IMPLEMENTED' },
}

module.exports = {
  httpCodes,
  formatter,
  respondJSON,
  globalErrorHandler,
  respond,
  handleError
}

function formatter (req, res, { status, message, data }) {
  status = httpCodes.hasOwnProperty(status) ? status : 500
  const stat = httpCodes[status]
  const response = {
    method: req.method.toUpperCase(),
    controler: this.name,
    resource: req.baseUrl || '/',
    success: stat.success,
    status,
    statusText: stat.text,
    message,
    data
  }
  return response
}

function respondJSON (req, res, { status, message, data }) {
  const json = formatter(req, res, { status, message, data })
  res.status(status).json(json)
}

function globalErrorHandler (err, req, res, next) {
  let payload = {
    status: err.status || err.statusCode || 500,
    message: err.message,
    data: {}
  }
  if (payload.status == 401 || payload.status == 400) {
    payload.data = err.stack.split('\n')[0] || []
  } else if (err.stack) {
    payload.data = err.stack.split('\n') || []
  } else {
    payload.data = []
  }
  respondJSON(req, res, payload)
}

function respond(req, res) {
  return {
    ok ({ message, data }) {
      const status = 200
      respondJSON(req, res, { status, message, data })
    },
    created ({ message, data }) {
      const status = 201
      respondJSON(req, res, { status, message, data })
    },
    accepted ({ message, data }) {
      const status = 202
      respondJSON(req, res, { status, message, data })
    },
    notModified ({ message, data }) {
      const status = 304
      respondJSON(req, res, { status, message, data })
    },
    badRequest ({ message, data }) {
      const status = 400
      respondJSON(req, res, { status, message, data })
    },
    unauthorized ({ message, data }) {
      const status = 401
      respondJSON(req, res, { status, message, data })
    },
    forbidden ({ message, data }) {
      const status = 403
      respondJSON(req, res, { status, message, data })
    },
    notFound ({ message }) {
      const status = 404
      respondJSON(req, res, { status, message, data: {} })
    },
    // Internal errors
    serverError (error) {
      console.log(error)
      const status = parseInt(error.statusCode) || 500
      const message = error.message || 'An error occurred.'
      const data = error
      respondJSON(req, res, { status, message, data })
    },
    notImplemented () {
      const status = 501
      const message = 'This endpoint is not yet implemented. Work in progress.'
      const data = {}
      respondJSON(req, res, { status, message, data })
    }
  }

}

function handleError (req, res, error) {
  // Map error messages to response types
  if (String(error.message).includes('Cast to ObjectId failed')) {
    const message = `Document with id: ${error.value} not found.`;
    respond(req, res).notFound({ message })
  } else {
    respond(req, res).serverError(error)
  }
}