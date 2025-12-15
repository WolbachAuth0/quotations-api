const path = require('path')
const { respond, httpCodes } = require('../middleware/responseFormatter')
const { QuotationModel } = require('../models/Quotation')
const { AuthorModel }= require('../models/Author')
const moment = require('moment');

module.exports = {
  quotations,
  kitchenSink,
  quoteById,
  author,
  docs,
  specification
}

function handleError (req, res, error) {
  let statusCode = 500 // default
  let data = {
    statusCode,
    statusText: httpCodes[statusCode],
    message: 'Server Error',
    imageSRC: '/assets/500-ServerError.png',
  }
  // handle special cases ...
  if (String(error.message).includes('Cast to ObjectId failed')) {
    statusCode = 404
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      message: 'The resource was not found.',
      imageSRC: '/assets/404-NotFound.png'
    }
  } else if (error?.status == 401) {
    statusCode = 401
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      message: 'Unauthorized',
      imageSRC: '/assets/401-Unauthorized.png'
    }
  } else if (error?.status == 403) {
    statusCode = 403
    data = {
      statusCode,
      statusText: httpCodes[statusCode],
      message: 'Access denied.',
      imageSRC: '/assets/403-Forbidden.png'
    }
  } else {
    console.log(error)
  }
  
  data.error = error
  res.render('error', data)
}

async function quotations (req, res) {
  try {
    // fetch quote and author names
    const sample = await QuotationModel.getRandom()
    const authorColumns = await makeAuthorColumns({ active: sample.author })

    // send data to template and render
    const data = {
      quotation: sample.format(),
      authorColumns
    }
    res.render('quotation', data);
  } catch (error) {
    handleError(req, res, error);
  }
}

async function quoteById (req, res) {
  try {
    const { quotation_id } = req.params;
    const quotation = await QuotationModel.findById(quotation_id);

    if (!quotation) {
      return notFound(req, res)
    }

    const authorColumns = await makeAuthorColumns({ active: quotation.author })

    // send data to template and render
    const data = {
      quotation: quotation.format(),
      authorColumns
    }
    res.render('quotation', data);
  } catch (error) {
    handleError(req, res, error);
  }
}

async function author (req, res) {
 try {
    const authors = await AuthorModel.find({ fullName: req.query.fullname});
    const author = authors[0]
    
    if (!author) {
      return notFound(req, res)
    }

    const quotationColumns = await makeQuotationColumns({ author: author.fullName })
    const authorColumns = await makeAuthorColumns({ active: author.fullName })

    let authorData = author.format();
    authorData.born = formatDate(authorData.born);
    authorData.died = formatDate(authorData.died);
    const data = {
      author: authorData,
      quotationColumns,
      authorColumns
    }
    res.render('author', data);
  } catch (error) {
    console.log(error)
    handleError(req, res, error);
  }
}

// Render the API documentation
function docs (req, res) {
  res.sendFile(path.join(__dirname, './../views/redoc.html'))
}

// Return the OpenAPI Specification as JSON
function specification (req, res) {
  const message = 'OpenAPI 3.0 specification for the Quotations API.'
  const data = require('../data/openapi.json')
  respond(req, res).ok({ message, data }) 
}

// Helper functions
async function makeAuthorColumns({ active }) {
   // find all distict authors
  const authorNames = await QuotationModel.find().distinct('author')
  
  // format authors into list elements
  // TODO: Use redis to cache this author aggregation
  const authorsList = authorNames.map(async function (name) {
    const quoteCount = await QuotationModel.countDocuments({ author: name })
    return {
      fullname: name,
      href: `/author?fullname=${encodeURIComponent(name)}`,
      active: name == active,
      quoteCount
    }
  })
  const authors = await Promise.all(authorsList)
    
  // chunk author list into four even coloumns
  const numColumns = 4
  const columnHeight = Math.ceil(authors.length / numColumns)
  const columns = [
    authors.slice(0, columnHeight),
    authors.slice(columnHeight, 2*columnHeight),
    authors.slice(2*columnHeight, 3*columnHeight),
    authors.slice(3*columnHeight),
  ]
  
  return columns
}

async function makeQuotationColumns({ author }) {
  // get all quotes by author name
  const quotationList = await QuotationModel.find({ author })
  const quotations = quotationList.map(x => x.format())

  // chunk quotation list into four even coloumns
  const numColumns = 4
  const columnHeight = Math.ceil(quotations.length / numColumns)
  const columns = [
    quotations.slice(0, columnHeight).map((x) => ({ id: x.id, text: x.text })),
    quotations.slice(columnHeight, 2 * columnHeight).map((x) => ({ id: x.id, text: x.text })),
    quotations.slice(2*columnHeight, 3*columnHeight).map((x) => ({ id: x.id, text: x.text })),
    quotations.slice(3*columnHeight).map((x) => ({ id: x.id, text: x.text }))
  ]

  return columns
}

function formatDate (date) {
  if (!date) {
    return null
  }

  const DD = moment(date);
  if (DD.year() < 1) {
    const year = Math.abs(DD.year()).toString();
    return `${DD.format('ddd, MMM Do')} ${year} BCE`
  } else {
    const dateFormat = 'ddd, MMM Do YYYY';
    return DD.format(dateFormat);
  }  
}

function notFound (req, res) { 
  let message
  if (req.originalUrl.includes('/author')) {
    message = `The author ${req.query.fullname} was not found.`
  } else if (req.originalUrl.includes('/quotation')) {
    message = `The quotation with id: ${req.params.quotation_id} was not found.`
  }
  const data = {
    statusCode: 404,
    statusText: httpCodes[statusCode],
    imageSRC: '/assets/404-NotFound.png',
    message
  }
  return res.render('error', data);
}
