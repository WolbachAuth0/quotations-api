const path = require('path')
const { respond, httpCodes } = require('../middleware/responseFormatter')
const { QuotationModel } = require('../models/Quotation')
const { AuthorModel }= require('../models/Author')

module.exports = {
  quotations,
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
    const columns = await authorColumns({ active: sample.author })

    // send data to template and render
    const data = {
      quotation: sample.format(),
      columns
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
      const data = {
        statusCode: 404,
        statusText: httpCodes[404],
        message: `The author ${req.query.fullname} was not found.`,
        imageSRC: '/assets/404-NotFound.png',
      }
      return res.render('error', data);
    }
    const columns = await quotationColumns({ author: author.fullName })
    const data = {
      author: author.format(),
      columns
    }
    res.render('author', data);
  } catch (error) {
    console.log(error)
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

    const columns = await authorColumns({ active: quotation.author })

    // send data to template and render
    const data = {
      quotation: quotation.format(),
      columns
    }
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

async function authorColumns({ active }) {
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

async function quotationColumns({ author }) {
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
