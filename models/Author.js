const mongoosePaginate = require('mongoose-paginate-v2')
const { Schema, model } = require('mongoose')

const structure = {
  fullName: { type: String, required: true, trim: true, unique: true, index: true },
  firstName: { type: String, required: false, trim: true },
  middleName: { type: String, required: false, trim: true },
  lastName: { type: String, required: false, trim: true },
  born: { type: Date, required: false },
  died: { type: Date, required: false },
  bio: { type: String, trim: true },
  reference: { type: String, trim: true },
  imageURL: { type: String, trim: true }
}

const authorSchema = {
  type: 'object',
  description: 'An Author document',
  required: ['fullName'],
  properties: {
    id: {
      type: 'string',
      readOnly: true,
      description: 'The unique identifier of this document.',
    },
    fullName: {
      type: 'string',
      example: 'Abraham Lincoln'
    },
    firstName: {
      type: 'string',
      example: 'Abraham'
    },
    middleName: {
      type: 'string',
      example: ''
    },
    lastName: {
      type: 'string',
      example: 'Lincoln'
    },
    born: {
      type: ['string', 'null'],
      description: 'The date that the author was born, or null.',
      example: '1819-02-12T04:00:00.000Z'
    },
    died: {
      type: ['string', 'null'],
      description: 'The date that the author died, or null.',
      example: '1865-04-15T04:00:00.000Z'
    },
    bio: {
      type: 'string',
      description: 'A short biography of the author.',
      example: ''
    },
    reference: {
      type: 'string',
      description: 'The source (or sources) of information in this document.',
      example: 'https://en.wikipedia.org/wiki/Abraham_Lincoln'
    },
    imageURL: {
      type: 'string',
      description: 'The source (or sources) of information in this document.',
      example: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Abraham_Lincoln_O-77_matte_collodion_print.jpg/800px-Abraham_Lincoln_O-77_matte_collodion_print.jpg'
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

class Author {
  constructor() {}

  // get fullName() { return `${this.firstName} ${this.lastName}` }

  format() {
    const formatted = {
      id: this._id,
      fullName: this.fullName,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      born: this.born,
      died: this.died,
      bio: this.bio,
      reference: this.reference,
      imageURL: this.imageURL,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      revision: this._v
    }
    return formatted
  }

  patch(body) {
    this.fullName = body.fullName ?? this.fullName
    this.firstName = body.firstName ?? this.firstName
    this.middleName = body.middleName ?? this.middleName
    this.lastName = body.lastName ?? this.lastName
    this.born = new Date(body.born) ?? this.born
    this.died = new Date(body.died) ?? this.died
    this.bio = body.bio ?? this.bio
    this.reference = body.reference ?? this.reference
    this.imageURL = body.imageURL ?? this.imageURL
    this.increment()
  }

  static parseQuery(query) {
    let filter = {}
    if (query.fullName) {
      filter.fullName = { $regex: `${query.fullName}`, $options: 'i' }
    }

    if (query.firstName) {
      filter.firstName = { $regex: `${query.firstName}`, $options: 'i' }
    }
    if (query.lastName) {
      filter.lastName = { $regex: query.lastName, $options: 'i' }
    }
    const options = {
      page: parseInt(query.page ?? 1),
      limit: parseInt(query.limit ?? 50),
      populate: ''
    }
    return { filter, options }
  }

  static parseInput(body) {
    const data = {
      fullName: body.fullName,
      firstName: body.firstName,
      middleName: body.middleName,
      lastName: body.lastName,
      born: body.born ? new Date(body.born) : null,
      died: body.died ? new Date(body.died) : null,
      bio: body.bio,
      reference: body.reference,
      imageURL: body.imageURL
    }
    return data
  }
}

const options = { timestamps: true }

const schema = new Schema(structure, options)
schema.loadClass(Author)
schema.plugin(mongoosePaginate)
const AuthorModel = model('Author', schema)

module.exports = {
  AuthorModel,
  authorSchema
}
