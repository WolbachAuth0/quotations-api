const path = require('path')
const { respond, httpCodes } = require('../middleware/responseFormatter')
const { QuotationModel } = require('../models/Quotation')

module.exports = {
  home,
  quoteById,
  docs,
  specification
}

function handleError (req, res, error) {
  let statusCode = 500 // default
  let data = {
    statusCode,
    statusText: httpCodes[statusCode],
    error: 'Server Error',
    imageSRC: '500-ServerError.png'
  }
  // handle special cases ...
  if (String(error.message).includes('Cast to ObjectId failed')) {
    statusCode = 404
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      error: 'The resource was not found.',
      imageSRC: '/assets/404-NotFound.png'
    }
  } else if (error?.status == 401) {
    statusCode = 401
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      error: 'Unauthorized',
      imageSRC: '/assets/401-Unauthorized.png'
    }
  } else if (error?.status == 403) {
    statusCode = 403
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      error: 'Access denied.',
      imageSRC: '/assets/403-Forbidden.png'
    }
  }
  res.render('error', data)
}

async function home (req, res) {
  try {
    const data = await QuotationModel.aggregate([{ $sample: { size: 1 } }])
    res.render('quotation', data[0]);
  } catch (error) {
    handleError(req, res, error);
  }
}

async function quoteById (req, res) {
  try {
    const { quotation_id } = req.params;
    const quotation = await QuotationModel.findById(quotation_id);

    if (!quotation) {
      const statusCode = 404
      const data = {
        statusCode,
        statusText: httpCodes[statusCode],
        error: `The quotation with id: ${quotation_id} was not found.`,
        imageSRC: '/assets/404-NotFound.png'
      }
      return res.render('error', data);
    }

    const data = quotation;
    res.render('quotation', data);
  } catch (error) {
    handleError(req, res, error);
  }
}

function docs (req, res) {
  res.sendFile(path.join(__dirname, './../views/redoc.html'))
}

function specification (req, res) {
  const message = 'OpenAPI 3.0 specification for the Quotations API.'
  const data = require('../data/openapi.json')
  respond(req, res).ok({ message, data }) 
}
