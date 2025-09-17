const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema, model } = require('mongoose')

const structure = {
  text: { type: String, required: true, unique: true, trim: true },
  author: { type: String, required: true, trim: true },
  source: { type: String, required: false },
}

const quotationSchema = {
  type: 'object',
  description: 'A Quotation document',
  required: ['text', 'author'],
  properties: {
    id: {
      type: 'string',
      readOnly: true,
      description: 'The unique identifier of this document.'
    },
    text: {
      type: 'string',
      description: 'The quotation text.',
      example: 'Courage stands halfway between cowardice and rashness, one of which is a lack, the other an excess of courage.'
    },
    author: {
      type: 'string',
      description: 'The full name of the author of this quotation.',
      example: 'Abraham Lincoln'
    },
    source: {
      type: 'string',
      description: 'The book, article, paper or speech that this quote is recorded from.',
      example: 'https://www.brainyquote.com/quotes/plutarch_387443'
    },
    createdAt: {
      type: 'string',
      readOnly: true,
      description: 'The date and time that this document was added to the database.'
    },
    updatedAt: {
      type: 'string',
      readOnly: true,
      description: 'The data and time that this document was last updated.'
    },
    version: {
      type: 'string',
      readOnly: true,
      description: 'The number of times this document has been altered.'
    }
  }
}

class Quotation {
  constructor ({ id, text, author, source, }) {

  }

  get authorLink () {
    const fullname = encodeURIComponent(this.author)
    return `/author?fullname=${fullname}`
  }

  /**
   * Formats the mongoose model as JSON for response to a request.
   * @returns {Object}
   */
  format () {
    const formatted = {
      id: this._id,
      text: this.text,
      author: this.author,
      authorLink: this.authorLink,
      source: this.source,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      version: this.__v
    }
    return formatted
  }

  /**
   * Updates the mongoose model propertied with relevant values passed to the function.
   * @param {Object} body The quote data to be updated.
   */
  patch (body) {
    this.text = body.text ?? this.text
    this.author = body.author ?? this.author
    this.source = body.source ?? this.source
    this.increment()
  }

  /**
   * Should search the Author collection for the best match to this.author by full name
   * @returns {Author} The Author object associated. 
   */
  Author () {}

  static async getRandom () {
    const sample = await QuotationModel.aggregate([{ $sample: { size: 1 } }])
    const quotation = await QuotationModel.findById(sample[0]._id)
    return quotation
  }

  static async listAuthors () {
    const authors = await QuotationModel.find().distinct('author')
    return authors
  }

  /**
   * Parses a url query into a mongoose-paginate-v2 query.
   * @param {Object} query A javascript object representing the url query
   * @returns {Object}
   */
  static parseQuery (query) {
    const filter = {}
    if (query.text) {
      filter.text = { $regex: `${query.text}`, $options: 'i' }
    }
    if (query.author) {
      filter.author = query.author
    }
    if (query.source) {
      filter.source = { $regex: query.source, $options: 'i' }
    }
    const options = {
      page: parseInt(query.page ?? 1),
      limit: parseInt(query.limit ?? 50),
      populate: '',
      sort: query.sort ?? 'author text'
    }
    if (query.populate && (query.populate.toUpperCase() === 'T')) {
      // should populate all populate-able fields
      options.populate = 'author'
    } else if (query.populate && query.populate.toLowerCase() === 'author') {
      options.populate = 'author'
    }
    return { filter, options }
  }

  /**
   * Used to extract quotation information from a request body.
   * @param {*} body The body of an http request containing quote data.
   * @returns {Object}
   */
  static parseInput (body) {
    const data = {
      text: body.text,
      author: body.author,
      citation: body.citation,
      source: body.source,
    }
    return data
  }
}

const options = {
  timestamps: true,
}

const quoteSchema = new Schema(structure, options)
quoteSchema.loadClass(Quotation)
quoteSchema.plugin(mongoosePaginate)
const QuotationModel = model('Quote', quoteSchema)

module.exports = {
  QuotationModel,
  quotationSchema
}
